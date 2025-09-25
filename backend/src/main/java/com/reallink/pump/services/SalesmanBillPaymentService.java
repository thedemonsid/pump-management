package com.reallink.pump.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.response.SalesmanBillPaymentResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.Customer;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanBillPayment;
import com.reallink.pump.entities.SalesmanNozzleShift;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanBillPaymentMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanBillPaymentRepository;
import com.reallink.pump.repositories.SalesmanNozzleShiftRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanBillPaymentService {

    private final SalesmanBillPaymentRepository repository;
    private final SalesmanNozzleShiftRepository salesmanNozzleShiftRepository;
    private final CustomerRepository customerRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final BankAccountRepository bankAccountRepository;
    private final SalesmanBillPaymentMapper mapper;

    public List<SalesmanBillPaymentResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public SalesmanBillPaymentResponse getById(@NotNull UUID id) {
        SalesmanBillPayment payment = repository.findById(id).orElse(null);
        if (payment == null) {
            throw new PumpBusinessException("SALESMAN_BILL_PAYMENT_NOT_FOUND", "Salesman bill payment with ID " + id + " not found");
        }
        return mapper.toResponse(payment);
    }

    @Transactional
    public SalesmanBillPaymentResponse create(@Valid CreateSalesmanBillPaymentRequest request) {
        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate salesman nozzle shift exists and is open
        SalesmanNozzleShift salesmanNozzleShift = salesmanNozzleShiftRepository.findById(request.getSalesmanNozzleShiftId()).orElse(null);
        if (salesmanNozzleShift == null) {
            throw new PumpBusinessException("INVALID_SALESMAN_NOZZLE_SHIFT",
                    "Salesman nozzle shift with ID " + request.getSalesmanNozzleShiftId() + " does not exist");
        }

        // Validate that the shift is still open (or recently closed for payment recording)
        if (salesmanNozzleShift.getStatus() != SalesmanNozzleShift.ShiftStatus.OPEN
                && salesmanNozzleShift.getStatus() != SalesmanNozzleShift.ShiftStatus.CLOSED) {
            throw new PumpBusinessException("INVALID_SHIFT_STATUS",
                    "Cannot record payment for shift with status: " + salesmanNozzleShift.getStatus());
        }

        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        if (customer == null) {
            throw new PumpBusinessException("INVALID_CUSTOMER",
                    "Customer with ID " + request.getCustomerId() + " does not exist");
        }

        // Validate bank account exists
        BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                    "Bank account with ID " + request.getBankAccountId() + " does not exist");
        }

        // Check for duplicate reference number
        // Note: We might want to allow same reference for different bills/shifts
        // Create bank transaction for the payment
        BankTransaction bankTransaction = new BankTransaction();
        bankTransaction.setBankAccount(bankAccount);
        bankTransaction.setTransactionDate(request.getPaymentDate());
        bankTransaction.setAmount(request.getAmount());
        bankTransaction.setTransactionType(BankTransaction.TransactionType.CREDIT); // Money coming into the account
        bankTransaction.setPaymentMethod(request.getPaymentMethod());
        bankTransaction.setDescription("Payment collected during shift from " + customer.getCustomerName() + " - " + request.getReferenceNumber());
        // Note: BankTransaction doesn't have referenceNumber field, using description instead

        // Create payment entity
        SalesmanBillPayment payment = mapper.toEntity(request);
        payment.setPumpMaster(pumpMaster);
        payment.setSalesmanNozzleShift(salesmanNozzleShift);
        payment.setCustomer(customer);
        payment.setBankAccount(bankAccount);
        payment.setBankTransaction(bankTransaction);

        // Save payment (bank transaction will be cascaded)
        SalesmanBillPayment savedPayment = repository.save(payment);

        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public SalesmanBillPaymentResponse update(@NotNull UUID id, @Valid UpdateSalesmanBillPaymentRequest request) {
        SalesmanBillPayment existingPayment = repository.findById(id).orElse(null);
        if (existingPayment == null) {
            throw new PumpBusinessException("SALESMAN_BILL_PAYMENT_NOT_FOUND", "Salesman bill payment with ID " + id + " not found");
        }

        // Validate salesman nozzle shift if being updated
        if (request.getSalesmanNozzleShiftId() != null) {
            SalesmanNozzleShift salesmanNozzleShift = salesmanNozzleShiftRepository.findById(request.getSalesmanNozzleShiftId()).orElse(null);
            if (salesmanNozzleShift == null) {
                throw new PumpBusinessException("INVALID_SALESMAN_NOZZLE_SHIFT",
                        "Salesman nozzle shift with ID " + request.getSalesmanNozzleShiftId() + " does not exist");
            }

            existingPayment.setSalesmanNozzleShift(salesmanNozzleShift);
        }

        // Validate customer if being updated
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                throw new PumpBusinessException("INVALID_CUSTOMER",
                        "Customer with ID " + request.getCustomerId() + " does not exist");
            }
            existingPayment.setCustomer(customer);
        }

        // Validate bank account if being updated
        if (request.getBankAccountId() != null) {
            BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
            if (bankAccount == null) {
                throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                        "Bank account with ID " + request.getBankAccountId() + " does not exist");
            }
            existingPayment.setBankAccount(bankAccount);
        }

        // Update payment fields using mapper
        mapper.updateEntityFromRequest(request, existingPayment);

        // Update bank transaction if amount changed
        if (request.getAmount() != null) {
            existingPayment.getBankTransaction().setAmount(request.getAmount());
        }
        if (request.getPaymentDate() != null) {
            existingPayment.getBankTransaction().setTransactionDate(request.getPaymentDate());
        }
        if (request.getPaymentMethod() != null) {
            existingPayment.getBankTransaction().setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getReferenceNumber() != null) {
            existingPayment.getBankTransaction().setDescription(
                    "Payment collected during shift from " + existingPayment.getCustomer().getCustomerName() + " - " + request.getReferenceNumber());
        }

        SalesmanBillPayment updatedPayment = repository.save(existingPayment);
        return mapper.toResponse(updatedPayment);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("SALESMAN_BILL_PAYMENT_NOT_FOUND", "Salesman bill payment with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public List<SalesmanBillPaymentResponse> getBySalesmanNozzleShiftId(@NotNull UUID salesmanNozzleShiftId) {
        return repository.findBySalesmanNozzleShift_Id(salesmanNozzleShiftId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillPaymentResponse> getByCustomerId(@NotNull UUID customerId) {
        return repository.findByCustomer_Id(customerId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public BigDecimal getTotalPaymentsForShift(@NotNull UUID shiftId) {
        return repository.getTotalPaymentsForShift(shiftId);
    }
}
