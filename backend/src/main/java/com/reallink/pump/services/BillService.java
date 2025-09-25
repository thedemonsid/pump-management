package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateBillItemRequest;
import com.reallink.pump.dto.request.CreateBillRequest;
import com.reallink.pump.dto.request.CreateCustomerBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateBillRequest;
import com.reallink.pump.dto.response.BillItemResponse;
import com.reallink.pump.dto.response.BillResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.Bill;
import com.reallink.pump.entities.BillItem;
import com.reallink.pump.entities.Customer;
import com.reallink.pump.entities.CustomerBillPayment;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.BillMapper;
import com.reallink.pump.mapper.CustomerBillPaymentMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.BillItemRepository;
import com.reallink.pump.repositories.BillRepository;
import com.reallink.pump.repositories.CustomerBillPaymentRepository;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BillService {

    private final BillRepository repository;
    private final BillItemRepository billItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final CustomerBillPaymentRepository customerBillPaymentRepository;
    private final BankAccountRepository bankAccountRepository;
    private final BillMapper mapper;
    private final CustomerBillPaymentMapper customerBillPaymentMapper;

    public List<BillResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public BillResponse getById(@NotNull UUID id) {
        Bill bill = repository.findById(id).orElse(null);
        if (bill == null) {
            throw new PumpBusinessException("BILL_NOT_FOUND", "Bill with ID " + id + " not found");
        }
        return mapper.toResponse(bill);
    }

    @Transactional
    public BillResponse create(@Valid CreateBillRequest request) {
        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        if (customer == null) {
            throw new PumpBusinessException("INVALID_CUSTOMER",
                    "Customer with ID " + request.getCustomerId() + " does not exist");
        }

        // Check for duplicate bill number
        if (repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_BILL_NO",
                    "Bill with number " + request.getBillNo() + " already exists for this pump master");
        }

        // Create bill entity
        Bill bill = mapper.toEntity(request);
        bill.setPumpMaster(pumpMaster);
        bill.setCustomer(customer);
        bill.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Create and add bill items
        for (CreateBillItemRequest itemRequest : request.getBillItems()) {
            BillItem billItem = mapper.toEntity(itemRequest);

            // Validate product exists
            Product product = productRepository.findById(itemRequest.getProductId()).orElse(null);
            if (product == null) {
                throw new PumpBusinessException("INVALID_PRODUCT",
                        "Product with ID " + itemRequest.getProductId() + " does not exist");
            }

            billItem.setBill(bill);
            billItem.setProduct(product);
            billItem.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

            // Calculate item amounts
            calculateBillItemAmounts(billItem, itemRequest);

            bill.getBillItems().add(billItem);
        }

        // Calculate totals
        calculateBillTotals(bill, new ArrayList<>(bill.getBillItems()));

        // Save bill with all related entities cascaded
        Bill savedBill = repository.save(bill);

        // Create payments if provided
        if (request.getPayments() != null && !request.getPayments().isEmpty()) {
            for (CreateCustomerBillPaymentRequest paymentRequest : request.getPayments()) {
                createPaymentForBill(savedBill, paymentRequest);
            }
        }

        return mapper.toResponse(savedBill);
    }

    @Transactional
    public BillResponse update(@NotNull UUID id, @Valid UpdateBillRequest request) {
        Bill existingBill = repository.findById(id).orElse(null);
        if (existingBill == null) {
            throw new PumpBusinessException("BILL_NOT_FOUND", "Bill with ID " + id + " not found");
        }

        // Check for duplicate bill number if number is being updated
        if (request.getBillNo() != null
                && !request.getBillNo().equals(existingBill.getBillNo())
                && repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), existingBill.getPumpMaster().getId())) {
            throw new PumpBusinessException("DUPLICATE_BILL_NO",
                    "Bill with number " + request.getBillNo() + " already exists for this pump master");
        }

        // Validate customer exists if being updated
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                throw new PumpBusinessException("INVALID_CUSTOMER",
                        "Customer with ID " + request.getCustomerId() + " does not exist");
            }
            existingBill.setCustomer(customer);
        }

        // Update bill fields using mapper
        mapper.updateEntityFromRequest(request, existingBill);

        // Update bill items if provided (null = leave as-is, empty list = remove all items)
        if (request.getBillItems() != null) {
            // Delete existing bill items (DB)
            billItemRepository.deleteByBill_Id(id);
            // Also clear in-memory collection to avoid stale/deleted children causing persistence issues
            existingBill.getBillItems().clear();

            if (request.getBillItems().isEmpty()) {
                // No items -> zero out totals
                existingBill.setTotalAmount(BigDecimal.ZERO);
                existingBill.setDiscountAmount(BigDecimal.ZERO);
                existingBill.setTaxAmount(BigDecimal.ZERO);
                existingBill.setNetAmount(BigDecimal.ZERO);
            } else {
                // Create new bill items
                for (CreateBillItemRequest itemRequest : request.getBillItems()) {
                    BillItem billItem = mapper.toEntity(itemRequest);

                    // Validate product exists
                    Product product = productRepository.findById(itemRequest.getProductId()).orElse(null);
                    if (product == null) {
                        throw new PumpBusinessException("INVALID_PRODUCT",
                                "Product with ID " + itemRequest.getProductId() + " does not exist");
                    }

                    billItem.setBill(existingBill);
                    billItem.setProduct(product);

                    // Calculate item amounts
                    calculateBillItemAmounts(billItem, itemRequest);

                    BillItem savedItem = billItemRepository.save(billItem);
                    existingBill.getBillItems().add(savedItem);
                }

                // Recalculate bill totals
                calculateBillTotals(existingBill, new ArrayList<>(existingBill.getBillItems()));
            }
        }

        Bill updatedBill = repository.save(existingBill);
        return mapper.toResponse(updatedBill);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("BILL_NOT_FOUND", "Bill with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    @Transactional
    public void deleteBillItem(@NotNull UUID billItemId) {
        BillItem billItem = billItemRepository.findById(billItemId).orElse(null);
        if (billItem == null) {
            throw new PumpBusinessException("BILL_ITEM_NOT_FOUND", "Bill item with ID " + billItemId + " not found");
        }

        Bill bill = billItem.getBill();
        if (bill == null) {
            // should not happen, but guard anyway
            billItemRepository.deleteById(billItemId);
            return;
        }

        UUID billId = bill.getId();

        // Delete the bill item (DB)
        billItemRepository.deleteById(billItemId);
        // Also remove from in-memory parent collection if present
        bill.getBillItems().removeIf(bi -> billItemId.equals(bi.getId()));

        // Recalculate totals from remaining items
        List<BillItem> remainingItems = billItemRepository.findByBill_Id(billId);

        calculateBillTotals(bill, remainingItems);

        repository.save(bill);
    }

    public Long getNextBillNo(@NotNull UUID pumpMasterId) {
        Long maxBillNo = repository.findMaxBillNoByPumpMasterId(pumpMasterId);
        return maxBillNo + 1;
    }

    private void calculateBillTotals(Bill bill, List<BillItem> billItems) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalNetAmount = BigDecimal.ZERO;

        for (BillItem item : billItems) {
            totalAmount = totalAmount.add(item.getAmount());
            BigDecimal discountAmount = item.getAmount().multiply(item.getDiscount().divide(BigDecimal.valueOf(100)));
            BigDecimal taxableAmount = item.getAmount().subtract(discountAmount);
            BigDecimal gstAmount = taxableAmount.multiply(item.getGst().divide(BigDecimal.valueOf(100)));
            totalDiscount = totalDiscount.add(discountAmount);
            totalTax = totalTax.add(gstAmount);
            totalNetAmount = totalNetAmount.add(item.getNetAmount());
        }

        bill.setTotalAmount(totalAmount);
        bill.setDiscountAmount(totalDiscount);
        bill.setTaxAmount(totalTax);
        bill.setNetAmount(totalNetAmount);
    }

    private void calculateBillItemAmounts(BillItem billItem, CreateBillItemRequest request) {
        BigDecimal quantity = request.getQuantity();
        BigDecimal amount = request.getRate().multiply(quantity);
        billItem.setAmount(amount);

        // Calculate discount amount (percentage)
        BigDecimal discountAmount = amount.multiply(request.getDiscount().divide(BigDecimal.valueOf(100)));
        // Calculate GST amount on (amount - discount)
        BigDecimal taxableAmount = amount.subtract(discountAmount);
        BigDecimal gstAmount = taxableAmount.multiply(request.getGst().divide(BigDecimal.valueOf(100)));
        // Net amount = taxable amount + GST
        BigDecimal netAmount = taxableAmount.add(gstAmount);

        billItem.setNetAmount(netAmount);
    }

    @Transactional
    public BillItemResponse createBillItem(@NotNull UUID billId, @Valid CreateBillItemRequest request) {
        Bill bill = repository.findById(billId).orElse(null);
        if (bill == null) {
            throw new PumpBusinessException("BILL_NOT_FOUND", "Bill with ID " + billId + " not found");
        }

        BillItem billItem = mapper.toEntity(request);

        // Validate product exists
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("INVALID_PRODUCT",
                    "Product with ID " + request.getProductId() + " does not exist");
        }

        billItem.setBill(bill);
        billItem.setProduct(product);
        billItem.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Calculate item amounts
        calculateBillItemAmounts(billItem, request);

        BillItem savedItem = billItemRepository.save(billItem);

        // Recalculate bill totals
        calculateBillTotals(bill, new ArrayList<>(bill.getBillItems()));

        repository.save(bill);

        return mapper.toResponse(savedItem);
    }

    @Transactional
    public BillItemResponse updateBillItem(@NotNull UUID billItemId, @Valid CreateBillItemRequest request) {
        BillItem existingItem = billItemRepository.findById(billItemId).orElse(null);
        if (existingItem == null) {
            throw new PumpBusinessException("BILL_ITEM_NOT_FOUND", "Bill item with ID " + billItemId + " not found");
        }

        Bill bill = existingItem.getBill();

        // Validate product exists
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("INVALID_PRODUCT",
                    "Product with ID " + request.getProductId() + " does not exist");
        }

        existingItem.setProduct(product);
        existingItem.setQuantity(request.getQuantity());
        existingItem.setRate(request.getRate());

        // Calculate item amounts
        calculateBillItemAmounts(existingItem, request);

        BillItem savedItem = billItemRepository.save(existingItem);

        // Recalculate bill totals
        calculateBillTotals(bill, new ArrayList<>(bill.getBillItems()));

        repository.save(bill);

        return mapper.toResponse(savedItem);
    }

    public List<BillResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByBillDateDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<BillResponse> getByPumpMasterIdAndDateRange(@NotNull UUID pumpMasterId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        return repository.findByPumpMasterIdAndBillDateBetweenOrderByBillDateDesc(pumpMasterId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<BillResponse> getByCustomerId(@NotNull UUID customerId) {
        return repository.findByCustomer_Id(customerId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    private void createPaymentForBill(Bill bill, CreateCustomerBillPaymentRequest request) {
        // Validate bank account exists
        BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                    "Bank account with ID " + request.getBankAccountId() + " does not exist");
        }

        // Validate payment amount doesn't exceed outstanding bill amount
        BigDecimal totalPaid = customerBillPaymentRepository.getTotalPaidAmountByBillId(bill.getId());
        if (totalPaid == null) {
            totalPaid = BigDecimal.ZERO;
        }
        BigDecimal outstandingAmount = bill.getNetAmount().subtract(totalPaid);
        if (request.getAmount().compareTo(outstandingAmount) > 0) {
            throw new PumpBusinessException("PAYMENT_AMOUNT_EXCEEDS_OUTSTANDING",
                    "Payment amount " + request.getAmount() + " exceeds outstanding amount " + outstandingAmount);
        }

        // Create bank transaction
        BankTransaction bankTransaction = createBankTransaction(request, bankAccount, bill);

        // Create payment entity
        CustomerBillPayment payment = customerBillPaymentMapper.toEntity(request);
        payment.setPumpMaster(bill.getPumpMaster());
        payment.setBill(bill);
        payment.setCustomer(bill.getCustomer());
        payment.setBankAccount(bankAccount);
        payment.setBankTransaction(bankTransaction);

        // Save payment (bank transaction will be saved via cascade)
        customerBillPaymentRepository.save(payment);
    }

    private BankTransaction createBankTransaction(CreateCustomerBillPaymentRequest request, BankAccount bankAccount, Bill bill) {
        BankTransaction transaction = new BankTransaction();
        transaction.setBankAccount(bankAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(BankTransaction.TransactionType.CREDIT);
        transaction.setDescription("Payment for Bill #" + bill.getBillNo() + " - " + request.getReferenceNumber());
        transaction.setTransactionDate(request.getPaymentDate());
        transaction.setPaymentMethod(request.getPaymentMethod());
        return transaction;
    }

}
