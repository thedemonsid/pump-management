package com.reallink.pump.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import com.reallink.pump.dto.request.CreateSalesmanBillRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillRequest;
import com.reallink.pump.dto.response.SalesmanBillResponse;
import com.reallink.pump.entities.Customer;
import com.reallink.pump.entities.FileStorage;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.ProductType;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanBill;
import com.reallink.pump.entities.SalesmanBillPayment;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanBillMapper;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanBillPaymentRepository;
import com.reallink.pump.repositories.SalesmanBillRepository;
import com.reallink.pump.repositories.SalesmanShiftRepository;
import com.reallink.pump.security.SecurityHelper;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanBillService {

    private final SalesmanBillRepository repository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SalesmanShiftRepository salesmanShiftRepository;
    private final SalesmanBillPaymentRepository salesmanBillPaymentRepository;
    private final SalesmanBillMapper mapper;
    private final FileStorageService fileStorageService;
    private final SecurityHelper securityHelper;

    /**
     * Validates the billing request based on billing mode - BY_QUANTITY:
     * quantity must be provided - BY_AMOUNT: requestedAmount must be provided
     */
    private void validateBillingRequest(CreateSalesmanBillRequest request) {
        if (request.getBillingMode() == null) {
            throw new PumpBusinessException("BILLING_MODE_REQUIRED", "Billing mode is required");
        }

        switch (request.getBillingMode()) {
            case BY_QUANTITY -> {
                if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new PumpBusinessException("INVALID_QUANTITY",
                            "Quantity is required and must be positive when billing mode is BY_QUANTITY");
                }
            }
            case BY_AMOUNT -> {
                if (request.getRequestedAmount() == null || request.getRequestedAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new PumpBusinessException("INVALID_AMOUNT",
                            "Requested amount is required and must be positive when billing mode is BY_AMOUNT");
                }
            }
        }

        if (request.getRate() == null || request.getRate().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PumpBusinessException("INVALID_RATE", "Rate is required and must be positive");
        }
    }

    /**
     * Validates payment type and cash payment details
     */
    private void validatePaymentRequest(CreateSalesmanBillRequest request) {
        // If payment type is CASH, cash payment details are required
        if (request.getPaymentType() == com.reallink.pump.entities.PaymentType.CASH) {
            if (request.getCashPayment() == null) {
                throw new PumpBusinessException("CASH_PAYMENT_REQUIRED",
                        "Cash payment details are required when payment type is CASH");
            }

            // Calculate expected bill amount
            BigDecimal expectedAmount;
            if (request.getBillingMode() == com.reallink.pump.entities.BillingMode.BY_QUANTITY) {
                expectedAmount = request.getQuantity().multiply(request.getRate()).setScale(2, RoundingMode.HALF_UP);
            } else {
                expectedAmount = request.getRequestedAmount();
            }

            // Validate payment amount matches bill amount
            if (request.getCashPayment().getAmount().compareTo(expectedAmount) != 0) {
                throw new PumpBusinessException("PAYMENT_AMOUNT_MISMATCH",
                        "Cash payment amount (" + request.getCashPayment().getAmount()
                        + ") must match the bill amount (" + expectedAmount + ")");
            }
        }
    }

    /**
     * Creates a cash payment record linked to the bill
     */
    private void createCashPayment(SalesmanBill bill, com.reallink.pump.dto.request.CashPaymentRequest cashPaymentRequest,
            PumpInfoMaster pumpMaster, Customer customer, SalesmanShift salesmanShift) {
        SalesmanBillPayment payment = new SalesmanBillPayment();
        payment.setPumpMaster(pumpMaster);
        payment.setSalesmanShift(salesmanShift);
        payment.setCustomer(customer);
        payment.setSalesmanBill(bill);
        payment.setAmount(cashPaymentRequest.getAmount());
        payment.setPaymentDate(cashPaymentRequest.getPaymentDate());
        payment.setPaymentMethod(cashPaymentRequest.getPaymentMethod());
        payment.setReferenceNumber(cashPaymentRequest.getReferenceNumber());
        payment.setNotes(cashPaymentRequest.getNotes());
        payment.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        salesmanBillPaymentRepository.save(payment);
    }

    public List<SalesmanBillResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public SalesmanBillResponse getById(@NotNull UUID id) {
        SalesmanBill bill = repository.findById(id).orElse(null);
        if (bill == null) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }
        return mapper.toResponse(bill);
    }

    @Transactional
    public SalesmanBillResponse create(@Valid CreateSalesmanBillRequest request) {
        // Validate billing mode and corresponding fields
        validateBillingRequest(request);

        // Validate payment type and cash payment details
        validatePaymentRequest(request);

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

        // Validate product exists and is FUEL type
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("INVALID_PRODUCT",
                    "Product with ID " + request.getProductId() + " does not exist");
        }
        if (product.getProductType() != ProductType.FUEL) {
            throw new PumpBusinessException("INVALID_PRODUCT_TYPE",
                    "Salesman bills can only contain FUEL products. Product " + product.getProductName() + " is of type " + product.getProductType());
        }

        // Validate salesman shift exists
        SalesmanShift salesmanShift = salesmanShiftRepository.findById(request.getSalesmanShiftId()).orElse(null);
        if (salesmanShift == null) {
            throw new PumpBusinessException("INVALID_SALESMAN_SHIFT",
                    "Salesman shift with ID " + request.getSalesmanShiftId() + " does not exist");
        }
        // Only check shift status for non-admin/manager users
        if (!salesmanShift.getStatus().equals(SalesmanShift.ShiftStatus.OPEN)
                && !securityHelper.isAdmin() && !securityHelper.isManager()) {
            throw new PumpBusinessException("SHIFT_NOT_OPEN",
                    "Cannot create salesman bill for closed shift. Shift status: " + salesmanShift.getStatus());
        }

        // Check for duplicate bill number
        if (repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_SALESMAN_BILL_NO",
                    "Salesman bill with number " + request.getBillNo() + " already exists for this pump master");
        }

        // Create salesman bill entity
        SalesmanBill bill = mapper.toEntity(request);
        bill.setPumpMaster(pumpMaster);
        bill.setCustomer(customer);
        bill.setProduct(product);
        bill.setSalesmanShift(salesmanShift);
        bill.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Calculate quantity and amount based on billing mode
        final BigDecimal quantity;
        final BigDecimal amount;

        if (request.getBillingMode() == com.reallink.pump.entities.BillingMode.BY_QUANTITY) {
            // Customer specified quantity, calculate amount
            quantity = request.getQuantity();
            amount = quantity.multiply(request.getRate()).setScale(2, RoundingMode.HALF_UP);
        } else {
            // Customer specified amount, calculate quantity
            amount = request.getRequestedAmount();
            quantity = amount.divide(request.getRate(), 3, RoundingMode.HALF_UP);
        }

        bill.setQuantity(quantity);
        bill.setAmount(amount);
        bill.setNetAmount(amount); // No tax, no discount

        // Save bill first
        SalesmanBill savedBill = repository.save(bill);

        // If payment type is CASH, create the payment record
        if (request.getPaymentType() == com.reallink.pump.entities.PaymentType.CASH && request.getCashPayment() != null) {
            createCashPayment(savedBill, request.getCashPayment(), pumpMaster, customer, salesmanShift);
        }

        return mapper.toResponse(savedBill);
    }

    @Transactional
    public SalesmanBillResponse createWithImages(
            @Valid CreateSalesmanBillRequest request,
            MultipartFile meterImage,
            MultipartFile vehicleImage,
            MultipartFile extraImage,
            @NotNull UUID pumpMasterId) {

        // Validate billing mode and corresponding fields
        validateBillingRequest(request);

        // Validate payment type and cash payment details
        validatePaymentRequest(request);

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

        // Validate product exists
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("INVALID_PRODUCT",
                    "Product with ID " + request.getProductId() + " does not exist");
        }
        // if (product.getProductType() != ProductType.FUEL) {
        //     throw new PumpBusinessException("INVALID_PRODUCT_TYPE",
        //             "Salesman bills can only contain FUEL products. Product " + product.getProductName() + " is of type " + product.getProductType());
        // }

        // Validate salesman shift exists
        SalesmanShift salesmanShift = salesmanShiftRepository.findById(request.getSalesmanShiftId()).orElse(null);
        if (salesmanShift == null) {
            throw new PumpBusinessException("INVALID_SALESMAN_SHIFT",
                    "Salesman shift with ID " + request.getSalesmanShiftId() + " does not exist");
        }
        // Only check shift status for non-admin/manager users
        if (!salesmanShift.getStatus().equals(SalesmanShift.ShiftStatus.OPEN)
                && !securityHelper.isAdmin() && !securityHelper.isManager()) {
            throw new PumpBusinessException("SHIFT_NOT_OPEN",
                    "Cannot create salesman bill for closed shift. Shift status: " + salesmanShift.getStatus());
        }

        // Check for duplicate bill number
        if (repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_SALESMAN_BILL_NO",
                    "Salesman bill with number " + request.getBillNo() + " already exists for this pump master");
        }

        // Handle image uploads
        FileStorage meterImageFile = null;
        FileStorage vehicleImageFile = null;
        FileStorage extraImageFile = null;

        if (meterImage != null && !meterImage.isEmpty()) {
            meterImageFile = fileStorageService.storeFile(meterImage, pumpMasterId, "SALESMAN_BILL_METER",
                    "Meter image for bill: " + request.getBillNo());
        }

        if (vehicleImage != null && !vehicleImage.isEmpty()) {
            vehicleImageFile = fileStorageService.storeFile(vehicleImage, pumpMasterId, "SALESMAN_BILL_VEHICLE",
                    "Vehicle image for bill: " + request.getBillNo());
        }

        if (extraImage != null && !extraImage.isEmpty()) {
            extraImageFile = fileStorageService.storeFile(extraImage, pumpMasterId, "SALESMAN_BILL_EXTRA",
                    "Extra image for bill: " + request.getBillNo());
        }

        // Create salesman bill entity
        SalesmanBill bill = mapper.toEntity(request);
        bill.setPumpMaster(pumpMaster);
        bill.setCustomer(customer);
        bill.setProduct(product);
        bill.setSalesmanShift(salesmanShift);
        bill.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Set images
        bill.setMeterImage(meterImageFile);
        bill.setVehicleImage(vehicleImageFile);
        bill.setExtraImage(extraImageFile);

        // Calculate quantity and amount based on billing mode
        final BigDecimal quantity;
        final BigDecimal amount;

        if (request.getBillingMode() == com.reallink.pump.entities.BillingMode.BY_QUANTITY) {
            // Customer specified quantity, calculate amount
            quantity = request.getQuantity();
            amount = quantity.multiply(request.getRate()).setScale(2, RoundingMode.HALF_UP);
        } else {
            // Customer specified amount, calculate quantity
            amount = request.getRequestedAmount();
            quantity = amount.divide(request.getRate(), 3, RoundingMode.HALF_UP);
        }

        bill.setQuantity(quantity);
        bill.setAmount(amount);
        bill.setNetAmount(amount); // No tax, no discount

        // Save bill first
        SalesmanBill savedBill = repository.save(bill);

        // If payment type is CASH, create the payment record
        if (request.getPaymentType() == com.reallink.pump.entities.PaymentType.CASH && request.getCashPayment() != null) {
            createCashPayment(savedBill, request.getCashPayment(), pumpMaster, customer, salesmanShift);
        }

        return mapper.toResponse(savedBill);
    }

    @Transactional
    public SalesmanBillResponse update(@NotNull UUID id, @Valid UpdateSalesmanBillRequest request) {
        SalesmanBill existingBill = repository.findById(id).orElse(null);
        if (existingBill == null) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }

        // Check for duplicate bill number if number is being updated
        if (request.getBillNo() != null
                && !request.getBillNo().equals(existingBill.getBillNo())
                && repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), existingBill.getPumpMaster().getId())) {
            throw new PumpBusinessException("DUPLICATE_SALESMAN_BILL_NO",
                    "Salesman bill with number " + request.getBillNo() + " already exists for this pump master");
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

        // Validate product exists and is FUEL type if being updated
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            if (product == null) {
                throw new PumpBusinessException("INVALID_PRODUCT",
                        "Product with ID " + request.getProductId() + " does not exist");
            }
            if (product.getProductType() != ProductType.FUEL) {
                throw new PumpBusinessException("INVALID_PRODUCT_TYPE",
                        "Salesman bills can only contain FUEL products. Product " + product.getProductName() + " is of type " + product.getProductType());
            }
            existingBill.setProduct(product);
        }

        // Validate salesman shift exists if being updated
        if (request.getSalesmanShiftId() != null) {
            SalesmanShift salesmanShift = salesmanShiftRepository.findById(request.getSalesmanShiftId()).orElse(null);
            if (salesmanShift == null) {
                throw new PumpBusinessException("INVALID_SALESMAN_SHIFT",
                        "Salesman shift with ID " + request.getSalesmanShiftId() + " does not exist");
            }
            // Only check shift status for non-admin/manager users
            if (!salesmanShift.getStatus().equals(SalesmanShift.ShiftStatus.OPEN)
                    && !securityHelper.isAdmin() && !securityHelper.isManager()) {
                throw new PumpBusinessException("SHIFT_NOT_OPEN",
                        "Cannot update salesman bill to closed shift. Shift status: " + salesmanShift.getStatus());
            }
            existingBill.setSalesmanShift(salesmanShift);
        }

        // Update bill fields using mapper
        mapper.updateEntityFromRequest(request, existingBill);

        // Recalculate amounts if quantity or rate changed
        if (request.getQuantity() != null || request.getRate() != null) {
            BigDecimal quantity = request.getQuantity() != null ? request.getQuantity() : existingBill.getQuantity();
            BigDecimal rate = request.getRate() != null ? request.getRate() : existingBill.getRate();
            BigDecimal amount = quantity.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            existingBill.setAmount(amount);
            existingBill.setNetAmount(amount);
        }

        SalesmanBill updatedBill = repository.save(existingBill);
        return mapper.toResponse(updatedBill);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }
        salesmanBillPaymentRepository.deleteBySalesmanBill_Id(id);
        repository.deleteById(id);
    }

    public Long getNextBillNo(@NotNull UUID pumpMasterId) {
        Long maxBillNo = repository.findMaxBillNoByPumpMasterId(pumpMasterId);
        return maxBillNo != null ? maxBillNo + 1 : 1;
    }

    public List<SalesmanBillResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByBillDateDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillResponse> getByPumpMasterIdAndDateRange(@NotNull UUID pumpMasterId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        return repository.findByPumpMasterIdAndBillDateBetweenOrderByBillDateDesc(pumpMasterId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillResponse> getByCustomerId(@NotNull UUID customerId) {
        return repository.findByCustomer_Id(customerId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillResponse> getByCustomerId(@NotNull UUID customerId, Integer limit) {
        if (limit != null && limit > 0) {
            return repository.findTopNByCustomerIdOrderByBillDateDesc(customerId, PageRequest.of(0, limit)).stream()
                    .map(mapper::toResponse)
                    .toList();
        }
        return getByCustomerId(customerId);
    }

    public List<SalesmanBillResponse> getBySalesmanShiftId(@NotNull UUID salesmanShiftId) {
        return repository.findBySalesmanShiftIdOrderByBillDateDesc(salesmanShiftId).stream()
                .map(mapper::toResponse)
                .toList();
    }
}
