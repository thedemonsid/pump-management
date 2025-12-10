package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateCustomerBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateCustomerBillPaymentRequest;
import com.reallink.pump.dto.response.CustomerBillPaymentResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.Bill;
import com.reallink.pump.entities.Customer;
import com.reallink.pump.entities.CustomerBillPayment;
import com.reallink.pump.entities.PaymentMethod;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.CustomerBillPaymentMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.BillRepository;
import com.reallink.pump.repositories.CustomerBillPaymentRepository;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerBillPaymentService {

    private final CustomerBillPaymentRepository repository;
    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final BankAccountRepository bankAccountRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final CustomerBillPaymentMapper mapper;

    public List<CustomerBillPaymentResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CustomerBillPaymentResponse> getAllByCustomerId(@NotNull UUID customerId) {
        return repository.findByCustomer_Id(customerId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CustomerBillPaymentResponse> getAllByCustomerId(@NotNull UUID customerId, Integer limit) {
        if (limit != null && limit > 0) {
            return repository.findTopNByCustomerIdOrderByPaymentDateDesc(customerId, PageRequest.of(0, limit)).stream()
                    .map(mapper::toResponse)
                    .toList();
        }
        return getAllByCustomerId(customerId);
    }

    public CustomerBillPaymentResponse getById(@NotNull UUID id) {
        CustomerBillPayment payment = repository.findById(id).orElse(null);
        if (payment == null) {
            throw new PumpBusinessException("PAYMENT_NOT_FOUND", "Customer bill payment with ID " + id + " not found");
        }
        return mapper.toResponse(payment);
    }

    public List<CustomerBillPaymentResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByPaymentDateDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CustomerBillPaymentResponse> getByBillId(@NotNull UUID billId) {
        return repository.findByBill_Id(billId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CustomerBillPaymentResponse> getGeneralPaymentsByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findGeneralPaymentsByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CustomerBillPaymentResponse> getByDateRange(@NotNull LocalDate fromDate, @NotNull LocalDate toDate) {
        return repository.findByPaymentDateRange(fromDate, toDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public CustomerBillPaymentResponse create(@Valid CreateCustomerBillPaymentRequest request) {
        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate bill exists (if provided)
        Bill bill = null;
        if (request.getBillId() != null) {
            bill = billRepository.findById(request.getBillId()).orElse(null);
            if (bill == null) {
                throw new PumpBusinessException("INVALID_BILL",
                        "Bill with ID " + request.getBillId() + " does not exist");
            }
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

        // Validate payment amount doesn't exceed outstanding bill amount (if bill is
        // provided)
        if (bill != null) {
            BigDecimal totalPaid = repository.getTotalPaidAmountByBillId(request.getBillId());
            if (totalPaid == null) {
                totalPaid = BigDecimal.ZERO;
            }
            BigDecimal outstandingAmount = bill.getNetAmount().subtract(totalPaid);
            if (request.getAmount().compareTo(outstandingAmount) > 0) {
                throw new PumpBusinessException("PAYMENT_AMOUNT_EXCEEDS_OUTSTANDING",
                        "Payment amount " + request.getAmount() + " exceeds outstanding amount " + outstandingAmount);
            }
        } else {
            // For general customer payments without specific bills, allow any positive
            // amount
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new PumpBusinessException("INVALID_AMOUNT",
                        "Payment amount must be greater than 0.00");
            }
        }

        // Create bank transaction
        BankTransaction bankTransaction = createBankTransaction(request, bankAccount, bill);

        // Create payment entity
        CustomerBillPayment payment = mapper.toEntity(request);
        payment.setPumpMaster(pumpMaster);
        payment.setBill(bill);
        payment.setCustomer(customer);
        payment.setBankAccount(bankAccount);
        payment.setBankTransaction(bankTransaction);
        payment.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Save payment (bank transaction will be saved via cascade)
        CustomerBillPayment savedPayment = repository.save(payment);

        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public CustomerBillPaymentResponse update(@NotNull UUID id, @Valid UpdateCustomerBillPaymentRequest request) {
        CustomerBillPayment existingPayment = repository.findById(id).orElse(null);
        if (existingPayment == null) {
            throw new PumpBusinessException("PAYMENT_NOT_FOUND", "Customer bill payment with ID " + id + " not found");
        }

        // Validate updated entities if provided
        if (request.getPumpMasterId() != null) {
            PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
            if (pumpMaster == null) {
                throw new PumpBusinessException("INVALID_PUMP_MASTER",
                        "Pump master with ID " + request.getPumpMasterId() + " does not exist");
            }
            existingPayment.setPumpMaster(pumpMaster);
        }

        if (request.getBillId() != null) {
            Bill bill = billRepository.findById(request.getBillId()).orElse(null);
            if (bill == null) {
                throw new PumpBusinessException("INVALID_BILL",
                        "Bill with ID " + request.getBillId() + " does not exist");
            }
            existingPayment.setBill(bill);
        } else {
            // Allow setting bill to null for general payments
            existingPayment.setBill(null);
        }

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                throw new PumpBusinessException("INVALID_CUSTOMER",
                        "Customer with ID " + request.getCustomerId() + " does not exist");
            }
            existingPayment.setCustomer(customer);
        }

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

        // Update bank transaction if amount or payment method changed
        if (request.getAmount() != null || request.getPaymentMethod() != null) {
            updateBankTransaction(existingPayment.getBankTransaction(), request, existingPayment.getBill());
        }

        CustomerBillPayment savedPayment = repository.save(existingPayment);
        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        CustomerBillPayment payment = repository.findById(id).orElse(null);
        if (payment == null) {
            throw new PumpBusinessException("PAYMENT_NOT_FOUND", "Customer bill payment with ID " + id + " not found");
        }
        repository.delete(payment); // Bank transaction will be deleted via cascade
    }

    private BankTransaction createBankTransaction(CreateCustomerBillPaymentRequest request, BankAccount bankAccount, Bill bill) {
        BankTransaction transaction = new BankTransaction();
        transaction.setBankAccount(bankAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(BankTransaction.TransactionType.CREDIT);
        // Use bill number instead of UUID for human-readable description
        String billRef = bill != null ? "#" + bill.getBillNo() : "General Payment";
        transaction.setDescription("Payment for Bill " + billRef + " - " + request.getReferenceNumber());
        transaction.setTransactionDate(request.getPaymentDate());
        transaction.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().name()));
        return transaction;
    }

    private void updateBankTransaction(BankTransaction transaction, UpdateCustomerBillPaymentRequest request, Bill bill) {
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
        }
        if (request.getPaymentMethod() != null) {
            transaction.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().name()));
        }
        if (request.getPaymentDate() != null) {
            transaction.setTransactionDate(request.getPaymentDate());
        }
        if (request.getReferenceNumber() != null) {
            // Use bill number instead of UUID for human-readable description
            String billRef = bill != null ? "#" + bill.getBillNo() : "General Payment";
            transaction.setDescription("Payment for Bill " + billRef + " - " + request.getReferenceNumber());
        }
    }
}
