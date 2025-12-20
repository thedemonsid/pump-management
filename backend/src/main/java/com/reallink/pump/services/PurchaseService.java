package com.reallink.pump.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreatePurchaseItemRequest;
import com.reallink.pump.dto.request.CreatePurchaseRequest;
import com.reallink.pump.dto.request.CreateSupplierPurchasePaymentRequest;
import com.reallink.pump.dto.request.UpdatePurchaseRequest;
import com.reallink.pump.dto.response.PurchaseResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.PaymentType;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Purchase;
import com.reallink.pump.entities.PurchaseItem;
import com.reallink.pump.entities.RateType;
import com.reallink.pump.entities.Supplier;
import com.reallink.pump.entities.SupplierPayment;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.PurchaseMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.PurchaseItemRepository;
import com.reallink.pump.repositories.PurchaseRepository;
import com.reallink.pump.repositories.SupplierPaymentRepository;
import com.reallink.pump.repositories.SupplierRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseService {

    private final PurchaseRepository repository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final BankAccountRepository bankAccountRepository;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final PurchaseMapper mapper;
    private final ProductService productService;

    public List<PurchaseResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<PurchaseResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PurchaseResponse getById(@NotNull UUID id) {
        Purchase purchase = repository.findById(id).orElse(null);
        if (purchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND", "Purchase with ID " + id + " not found");
        }
        return mapper.toResponse(purchase);
    }

    public List<PurchaseResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<PurchaseResponse> getBySupplierId(@NotNull UUID supplierId) {
        return repository.findTopNBySupplierIdOrderByPurchaseDateDesc(supplierId, PageRequest.of(0, Integer.MAX_VALUE)).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<PurchaseResponse> getBySupplierId(@NotNull UUID supplierId, Integer limit) {
        if (limit != null && limit > 0) {
            return repository.findTopNBySupplierIdOrderByPurchaseDateDesc(supplierId, PageRequest.of(0, limit)).stream()
                    .map(mapper::toResponse)
                    .toList();
        }
        return getBySupplierId(supplierId);
    }

    public List<PurchaseResponse> getByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId,
            java.time.LocalDate fromDate,
            java.time.LocalDate toDate) {

        // Set default values if dates are not provided
        java.time.LocalDate effectiveFromDate = fromDate != null ? fromDate : java.time.LocalDate.of(2000, 1, 1);
        java.time.LocalDate effectiveToDate = toDate != null ? toDate : java.time.LocalDate.now();

        return repository.findByPumpMasterIdAndDateRange(pumpMasterId, effectiveFromDate, effectiveToDate)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PurchaseResponse getByPurchaseIdAndPumpMasterId(@NotNull Long purchaseId, @NotNull UUID pumpMasterId) {
        Purchase purchase = repository.findByPurchaseIdAndPumpMaster_Id(purchaseId, pumpMasterId).orElse(null);
        if (purchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND",
                    "Purchase with purchase ID " + purchaseId + " and pump master ID " + pumpMasterId + " not found");
        }
        return mapper.toResponse(purchase);
    }

    @Transactional
    public PurchaseResponse create(@Valid CreatePurchaseRequest request) {
        // Validate pump master
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        if (supplier == null) {
            throw new PumpBusinessException("INVALID_SUPPLIER",
                    "Supplier with ID " + request.getSupplierId() + " does not exist");
        }

        // Check for duplicate invoice number
        if (repository.existsByInvoiceNumberAndPumpMaster_Id(request.getInvoiceNumber(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_INVOICE",
                    "Purchase with invoice number '" + request.getInvoiceNumber() + "' already exists for this pump master");
        }

        // Generate purchaseId
        Long maxPurchaseId = repository.findMaxPurchaseIdByPumpMasterId(request.getPumpMasterId());
        Long newPurchaseId = maxPurchaseId + 1;

        // Create purchase entity
        Purchase purchase = mapper.toEntity(request);
        purchase.setPumpMaster(pumpMaster);
        purchase.setSupplier(supplier);
        purchase.setPurchaseId(newPurchaseId);
        purchase.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Create and add purchase items
        for (CreatePurchaseItemRequest itemRequest : request.getPurchaseItems()) {
            PurchaseItem purchaseItem = mapper.toEntity(itemRequest);

            // Validate product exists
            Product product = productRepository.findById(itemRequest.getProductId()).orElse(null);
            if (product == null) {
                throw new PumpBusinessException("INVALID_PRODUCT",
                        "Product with ID " + itemRequest.getProductId() + " does not exist");
            }

            purchaseItem.setPurchase(purchase);
            purchaseItem.setProduct(product);
            purchaseItem.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

            // Calculate item amounts
            calculatePurchaseItemAmounts(purchaseItem, itemRequest, purchase.getRateType());

            purchase.getPurchaseItems().add(purchaseItem);

            // Update stock if addToStock is true
            if (itemRequest.getAddToStock() != null && itemRequest.getAddToStock()) {
                productService.updateStockQuantity(product.getId(), itemRequest.getQuantity());
            }
        }

        // Calculate totals
        calculatePurchaseTotals(purchase, new ArrayList<>(purchase.getPurchaseItems()));

        // Save purchase with all related entities cascaded
        Purchase savedPurchase = repository.save(purchase);

        // Validate and create payments if provided
        if (request.getPayments() != null && !request.getPayments().isEmpty()) {
            BigDecimal totalPayments = request.getPayments().stream()
                    .map(CreateSupplierPurchasePaymentRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Validate CASH payment type requires exact payment match
            if (request.getPaymentType() == PaymentType.CASH) {
                if (totalPayments.compareTo(savedPurchase.getNetAmount()) != 0) {
                    throw new PumpBusinessException("INVALID_CASH_PAYMENT",
                            "For CASH payment type, total payments (" + totalPayments
                            + ") must equal net amount (" + savedPurchase.getNetAmount() + ")");
                }
            }

            for (CreateSupplierPurchasePaymentRequest paymentRequest : request.getPayments()) {
                createPaymentForPurchase(savedPurchase, paymentRequest);
            }
        } else if (request.getPaymentType() == PaymentType.CASH) {
            // CASH type with no payments is invalid
            throw new PumpBusinessException("INVALID_CASH_PAYMENT",
                    "CASH payment type requires payment entries matching the total amount");
        }

        return mapper.toResponse(savedPurchase);
    }

    private void calculatePurchaseTotals(Purchase purchase, List<PurchaseItem> purchaseItems) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (PurchaseItem item : purchaseItems) {
            totalAmount = totalAmount.add(item.getAmount());
            totalTax = totalTax.add(item.getTaxAmount());
        }

        purchase.setTotalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP));
        purchase.setTaxAmount(totalTax.setScale(2, RoundingMode.HALF_UP));
        purchase.setNetAmount(totalAmount.add(totalTax).setScale(2, RoundingMode.HALF_UP));
    }

    private void calculatePurchaseItemAmounts(PurchaseItem purchaseItem, CreatePurchaseItemRequest request, RateType rateType) {
        BigDecimal quantity = BigDecimal.valueOf(request.getQuantity());
        BigDecimal rate = request.getPurchaseRate();
        BigDecimal taxPercentage = request.getTaxPercentage().setScale(2, RoundingMode.HALF_UP);
        purchaseItem.setTaxPercentage(taxPercentage);

        BigDecimal amount;
        BigDecimal taxAmount;

        if (rateType == RateType.INCLUDING_GST) {
            // Tax is already included in the rate
            // Total amount = rate × quantity (this is the final amount)
            BigDecimal totalAmount = rate.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

            // Extract the tax component: totalAmount = baseAmount × (1 + taxPercentage/100)
            // baseAmount = totalAmount / (1 + taxPercentage/100)
            // taxAmount = totalAmount - baseAmount
            BigDecimal divisor = BigDecimal.ONE.add(taxPercentage.divide(BigDecimal.valueOf(100)));
            BigDecimal baseAmount = totalAmount.divide(divisor, 2, RoundingMode.HALF_UP);
            taxAmount = totalAmount.subtract(baseAmount);

            // Store base amount (without tax) in amount field
            amount = baseAmount;
        } else {
            // Tax is excluded, calculate it
            // Base amount = rate × quantity
            amount = rate.multiply(quantity).setScale(2, RoundingMode.HALF_UP);
            // Tax is calculated on top of base amount
            taxAmount = amount.multiply(taxPercentage.divide(BigDecimal.valueOf(100))).setScale(2, RoundingMode.HALF_UP);
        }

        purchaseItem.setAmount(amount);
        purchaseItem.setTaxAmount(taxAmount);
    }

    private void createPaymentForPurchase(Purchase purchase, CreateSupplierPurchasePaymentRequest request) {
        // Validate bank account exists
        BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                    "Bank account with ID " + request.getBankAccountId() + " does not exist");
        }

        // Create bank transaction
        BankTransaction bankTransaction = createBankTransaction(request, bankAccount, purchase);

        // Create payment entity
        SupplierPayment payment = new SupplierPayment();
        payment.setPumpMaster(purchase.getPumpMaster());
        payment.setPurchase(purchase);
        payment.setSupplier(purchase.getSupplier());
        payment.setBankAccount(bankAccount);
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setNotes(request.getNotes());
        payment.setBankTransaction(bankTransaction);
        payment.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Save payment (bank transaction will be saved via cascade)
        supplierPaymentRepository.save(payment);
    }

    private BankTransaction createBankTransaction(CreateSupplierPurchasePaymentRequest request, BankAccount bankAccount, Purchase purchase) {
        BankTransaction transaction = new BankTransaction();
        transaction.setBankAccount(bankAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(BankTransaction.TransactionType.DEBIT);
        transaction.setDescription("Payment for Purchase #" + purchase.getPurchaseId() + " - " + request.getReferenceNumber());
        transaction.setTransactionDate(request.getPaymentDate());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        return transaction;
    }

    public Long getNextPurchaseId(@NotNull UUID pumpMasterId) {
        Long maxPurchaseId = repository.findMaxPurchaseIdByPumpMasterId(pumpMasterId);
        return maxPurchaseId + 1;
    }

    @Transactional
    public PurchaseResponse update(@NotNull UUID id, @Valid UpdatePurchaseRequest request) {
        Purchase existingPurchase = repository.findById(id).orElse(null);
        if (existingPurchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND", "Purchase with ID " + id + " not found");
        }

        // Validate supplier if provided
        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
            if (supplier == null) {
                throw new PumpBusinessException("INVALID_SUPPLIER",
                        "Supplier with ID " + request.getSupplierId() + " does not exist");
            }
            existingPurchase.setSupplier(supplier);
        }

        // Check for duplicate invoice number if being updated
        if (request.getInvoiceNumber() != null
                && !request.getInvoiceNumber().equals(existingPurchase.getInvoiceNumber())
                && repository.existsByInvoiceNumberAndPumpMaster_IdAndIdNot(request.getInvoiceNumber(),
                        existingPurchase.getPumpMaster().getId(), id)) {
            throw new PumpBusinessException("DUPLICATE_INVOICE",
                    "Purchase with invoice number '" + request.getInvoiceNumber() + "' already exists for this pump master");
        }

        // Update purchase fields using mapper
        mapper.updateEntityFromRequest(request, existingPurchase);

        // Update purchase items if provided
        if (request.getPurchaseItems() != null && !request.getPurchaseItems().isEmpty()) {
            // Revert stock changes from old items
            for (PurchaseItem oldItem : existingPurchase.getPurchaseItems()) {
                if (oldItem.getAddToStock() != null && oldItem.getAddToStock()) {
                    Product product = oldItem.getProduct();
                    productService.updateStockQuantity(product.getId(), -oldItem.getQuantity());
                }
            }

            // Clear old items
            purchaseItemRepository.deleteAll(existingPurchase.getPurchaseItems());
            existingPurchase.getPurchaseItems().clear();

            // Add new items
            for (CreatePurchaseItemRequest itemRequest : request.getPurchaseItems()) {
                PurchaseItem purchaseItem = mapper.toEntity(itemRequest);

                // Validate product exists
                Product product = productRepository.findById(itemRequest.getProductId()).orElse(null);
                if (product == null) {
                    throw new PumpBusinessException("INVALID_PRODUCT",
                            "Product with ID " + itemRequest.getProductId() + " does not exist");
                }

                purchaseItem.setPurchase(existingPurchase);
                purchaseItem.setProduct(product);
                purchaseItem.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

                // Calculate item amounts
                calculatePurchaseItemAmounts(purchaseItem, itemRequest, existingPurchase.getRateType());

                existingPurchase.getPurchaseItems().add(purchaseItem);

                // Update stock if addToStock is true
                if (itemRequest.getAddToStock() != null && itemRequest.getAddToStock()) {
                    productService.updateStockQuantity(product.getId(), itemRequest.getQuantity());
                }
            }

            // Recalculate totals
            calculatePurchaseTotals(existingPurchase, new ArrayList<>(existingPurchase.getPurchaseItems()));
        }

        // Update payments if provided
        if (request.getPayments() != null && !request.getPayments().isEmpty()) {
            // Delete old payments and their bank transactions
            for (SupplierPayment oldPayment : existingPurchase.getSupplierPayments()) {
                supplierPaymentRepository.delete(oldPayment);
            }
            existingPurchase.getSupplierPayments().clear();

            // Add new payments
            BigDecimal totalPayments = request.getPayments().stream()
                    .map(CreateSupplierPurchasePaymentRequest::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Validate CASH payment type requires exact payment match
            if (existingPurchase.getPaymentType() == PaymentType.CASH) {
                if (totalPayments.compareTo(existingPurchase.getNetAmount()) != 0) {
                    throw new PumpBusinessException("INVALID_CASH_PAYMENT",
                            "For CASH payment type, total payments (" + totalPayments
                            + ") must equal net amount (" + existingPurchase.getNetAmount() + ")");
                }
            }

            for (CreateSupplierPurchasePaymentRequest paymentRequest : request.getPayments()) {
                createPaymentForPurchase(existingPurchase, paymentRequest);
            }
        } else if (existingPurchase.getPaymentType() == PaymentType.CASH && existingPurchase.getSupplierPayments().isEmpty()) {
            // CASH type with no payments is invalid
            throw new PumpBusinessException("INVALID_CASH_PAYMENT",
                    "CASH payment type requires payment entries matching the total amount");
        }

        Purchase updatedPurchase = repository.save(existingPurchase);
        return mapper.toResponse(updatedPurchase);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        Purchase purchase = repository.findById(id).orElse(null);
        if (purchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND", "Purchase with ID " + id + " not found");
        }

        // Adjust stock for all items that were added to stock
        for (PurchaseItem item : purchase.getPurchaseItems()) {
            if (item.getAddToStock() != null && item.getAddToStock()) {
                Product product = item.getProduct();
                productService.updateStockQuantity(product.getId(), -item.getQuantity());
            }
        }

        repository.deleteById(id);
    }

    public boolean existsByPurchaseIdAndPumpMasterId(@NotNull Long purchaseId, @NotNull UUID pumpMasterId) {
        return repository.existsByPurchaseIdAndPumpMaster_Id(purchaseId, pumpMasterId);
    }

    public boolean existsByInvoiceNumberAndPumpMasterId(@NotNull String invoiceNumber, @NotNull UUID pumpMasterId) {
        return repository.existsByInvoiceNumberAndPumpMaster_Id(invoiceNumber, pumpMasterId);
    }
}
