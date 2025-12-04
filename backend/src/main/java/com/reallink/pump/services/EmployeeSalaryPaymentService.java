package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateEmployeeSalaryPaymentRequest;
import com.reallink.pump.dto.request.UpdateEmployeeSalaryPaymentRequest;
import com.reallink.pump.dto.response.EmployeeSalaryPaymentResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.CalculatedSalary;
import com.reallink.pump.entities.EmployeeSalaryPayment;
import com.reallink.pump.entities.PaymentMethod;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.User;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.EmployeeSalaryPaymentMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.CalculatedSalaryRepository;
import com.reallink.pump.repositories.EmployeeSalaryPaymentRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeSalaryPaymentService {

    private final EmployeeSalaryPaymentRepository repository;
    private final UserRepository userRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final BankAccountRepository bankAccountRepository;
    private final CalculatedSalaryRepository calculatedSalaryRepository;
    private final EmployeeSalaryPaymentMapper mapper;

    public List<EmployeeSalaryPaymentResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByPaymentDateDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<EmployeeSalaryPaymentResponse> getByUserId(@NotNull UUID userId, @NotNull UUID pumpMasterId) {
        return repository.findByUserIdAndPumpMasterId(userId, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<EmployeeSalaryPaymentResponse> getByCalculatedSalaryId(
            @NotNull UUID calculatedSalaryId,
            @NotNull UUID pumpMasterId) {
        return repository.findByCalculatedSalaryIdAndPumpMasterId(calculatedSalaryId, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<EmployeeSalaryPaymentResponse> getAdvancePayments(@NotNull UUID pumpMasterId) {
        return repository.findAdvancePaymentsByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public BigDecimal getTotalPaidByCalculatedSalaryId(
            @NotNull UUID calculatedSalaryId,
            @NotNull UUID pumpMasterId) {
        return repository.getTotalPaidAmountByCalculatedSalaryIdAndPumpMasterId(calculatedSalaryId, pumpMasterId);
    }

    public BigDecimal getTotalPaidByUserId(@NotNull UUID userId, @NotNull UUID pumpMasterId) {
        return repository.getTotalPaidAmountByUserIdAndPumpMasterId(userId, pumpMasterId);
    }

    public BigDecimal getTotalPaymentsInPeriod(
            @NotNull UUID pumpMasterId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate) {
        return repository.findTotalPaymentsInPeriod(pumpMasterId, startDate, endDate);
    }

    public EmployeeSalaryPaymentResponse getById(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        EmployeeSalaryPayment payment = repository.findById(id).orElse(null);
        if (payment == null) {
            throw new PumpBusinessException("SALARY_PAYMENT_NOT_FOUND",
                    "Salary payment with ID " + id + " not found");
        }

        if (!payment.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Salary payment does not belong to the specified pump master");
        }

        return mapper.toResponse(payment);
    }

    @Transactional
    public EmployeeSalaryPaymentResponse create(@Valid CreateEmployeeSalaryPaymentRequest request) {
        // Fetch the user
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("USER_NOT_FOUND",
                    "User with ID " + request.getUserId() + " does not exist");
        }

        // Verify user belongs to the pump master
        if (!user.getPumpMaster().getId().equals(request.getPumpMasterId())) {
            throw new PumpBusinessException("INVALID_USER",
                    "User does not belong to the specified pump master");
        }

        // Fetch the PumpInfoMaster entity
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Fetch the bank account
        BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND",
                    "Bank account with ID " + request.getBankAccountId() + " does not exist");
        }

        // Verify bank account belongs to the pump master
        if (!bankAccount.getPumpMaster().getId().equals(request.getPumpMasterId())) {
            throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                    "Bank account does not belong to the specified pump master");
        }

        // Fetch calculated salary if provided
        CalculatedSalary calculatedSalary = null;
        if (request.getCalculatedSalaryId() != null) {
            calculatedSalary = calculatedSalaryRepository.findById(request.getCalculatedSalaryId()).orElse(null);
            if (calculatedSalary == null) {
                throw new PumpBusinessException("CALCULATED_SALARY_NOT_FOUND",
                        "Calculated salary with ID " + request.getCalculatedSalaryId() + " does not exist");
            }

            // Verify calculated salary belongs to the user and pump master
            if (!calculatedSalary.getUser().getId().equals(request.getUserId())
                    || !calculatedSalary.getPumpMaster().getId().equals(request.getPumpMasterId())) {
                throw new PumpBusinessException("INVALID_CALCULATED_SALARY",
                        "Calculated salary does not belong to the specified user and pump master");
            }
        }

        // Create bank transaction
        BankTransaction bankTransaction = createBankTransaction(request, bankAccount, calculatedSalary, user);

        EmployeeSalaryPayment payment = mapper.toEntity(request);
        payment.setUser(user);
        payment.setPumpMaster(pumpMaster);
        payment.setBankAccount(bankAccount);
        payment.setCalculatedSalary(calculatedSalary);
        payment.setBankTransaction(bankTransaction);

        EmployeeSalaryPayment savedPayment = repository.save(payment);
        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public EmployeeSalaryPaymentResponse update(
            @NotNull UUID id,
            @Valid UpdateEmployeeSalaryPaymentRequest request,
            @NotNull UUID pumpMasterId) {
        EmployeeSalaryPayment existingPayment = repository.findById(id).orElse(null);
        if (existingPayment == null) {
            throw new PumpBusinessException("SALARY_PAYMENT_NOT_FOUND",
                    "Salary payment with ID " + id + " not found");
        }

        // Verify payment belongs to the pump master
        if (!existingPayment.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Salary payment does not belong to the specified pump master");
        }

        // Update bank account if changed
        if (request.getBankAccountId() != null
                && !request.getBankAccountId().equals(existingPayment.getBankAccount().getId())) {
            BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
            if (bankAccount == null) {
                throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND",
                        "Bank account with ID " + request.getBankAccountId() + " does not exist");
            }

            // Verify bank account belongs to the pump master
            if (!bankAccount.getPumpMaster().getId().equals(pumpMasterId)) {
                throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                        "Bank account does not belong to the specified pump master");
            }

            existingPayment.setBankAccount(bankAccount);
            existingPayment.getBankTransaction().setBankAccount(bankAccount);
        }

        // Update calculated salary if changed
        if (request.getCalculatedSalaryId() != null) {
            CalculatedSalary calculatedSalary = calculatedSalaryRepository.findById(request.getCalculatedSalaryId()).orElse(null);
            if (calculatedSalary == null) {
                throw new PumpBusinessException("CALCULATED_SALARY_NOT_FOUND",
                        "Calculated salary with ID " + request.getCalculatedSalaryId() + " does not exist");
            }

            // Verify calculated salary belongs to the user and pump master
            if (!calculatedSalary.getUser().getId().equals(existingPayment.getUser().getId())
                    || !calculatedSalary.getPumpMaster().getId().equals(pumpMasterId)) {
                throw new PumpBusinessException("INVALID_CALCULATED_SALARY",
                        "Calculated salary does not belong to the specified user and pump master");
            }

            existingPayment.setCalculatedSalary(calculatedSalary);
        }

        // Update bank transaction
        updateBankTransaction(existingPayment.getBankTransaction(), request,
                existingPayment.getCalculatedSalary(), existingPayment.getUser());

        mapper.updateEntityFromRequest(request, existingPayment);

        EmployeeSalaryPayment savedPayment = repository.save(existingPayment);
        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public void delete(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        EmployeeSalaryPayment payment = repository.findById(id).orElse(null);
        if (payment == null) {
            throw new PumpBusinessException("SALARY_PAYMENT_NOT_FOUND",
                    "Salary payment with ID " + id + " not found");
        }

        // Verify payment belongs to the pump master
        if (!payment.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Salary payment does not belong to the specified pump master");
        }

        repository.delete(payment); // Bank transaction will be deleted via cascade
    }

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy");

    private BankTransaction createBankTransaction(
            CreateEmployeeSalaryPaymentRequest request,
            BankAccount bankAccount,
            CalculatedSalary calculatedSalary,
            User user) {
        BankTransaction transaction = new BankTransaction();
        transaction.setBankAccount(bankAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(BankTransaction.TransactionType.DEBIT);

        // Use human-readable salary period instead of UUID
        String salaryPeriod = calculatedSalary != null
                ? calculatedSalary.getFromDate().format(DATE_FORMATTER) + " to " + calculatedSalary.getToDate().format(DATE_FORMATTER)
                : "Advance Payment";
        String salaryType = calculatedSalary != null ? "Salary" : "Advance";
        transaction.setDescription(salaryType + " Payment to " + user.getUsername() + " (" + salaryPeriod + ") - " + request.getReferenceNumber());
        transaction.setTransactionDate(request.getPaymentDate());
        transaction.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().name()));
        return transaction;
    }

    private void updateBankTransaction(
            BankTransaction transaction,
            UpdateEmployeeSalaryPaymentRequest request,
            CalculatedSalary calculatedSalary,
            User user) {
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
            // Use human-readable salary period instead of UUID
            String salaryPeriod = calculatedSalary != null
                    ? calculatedSalary.getFromDate().format(DATE_FORMATTER) + " to " + calculatedSalary.getToDate().format(DATE_FORMATTER)
                    : "Advance Payment";
            String salaryType = calculatedSalary != null ? "Salary" : "Advance";
            transaction.setDescription(salaryType + " Payment to " + user.getUsername() + " (" + salaryPeriod + ") - " + request.getReferenceNumber());
        }
    }
}
