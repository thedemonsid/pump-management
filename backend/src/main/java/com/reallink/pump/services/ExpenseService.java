package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateBankTransactionRequest;
import com.reallink.pump.dto.request.CreateExpenseRequest;
import com.reallink.pump.dto.request.UpdateExpenseRequest;
import com.reallink.pump.dto.response.BankTransactionResponse;
import com.reallink.pump.dto.response.ExpenseResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.Expense;
import com.reallink.pump.entities.Expense.ExpenseType;
import com.reallink.pump.entities.ExpenseHead;
import com.reallink.pump.entities.FileStorage;
import com.reallink.pump.entities.PaymentMethod;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanNozzleShift;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.ExpenseMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.BankTransactionRepository;
import com.reallink.pump.repositories.ExpenseHeadRepository;
import com.reallink.pump.repositories.ExpenseRepository;
import com.reallink.pump.repositories.FileStorageRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanNozzleShiftRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final ExpenseHeadRepository expenseHeadRepository;
    private final SalesmanNozzleShiftRepository salesmanNozzleShiftRepository;
    private final BankAccountRepository bankAccountRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final FileStorageRepository fileStorageRepository;
    private final ExpenseMapper mapper;
    private final BankTransactionService bankTransactionService;

    public List<ExpenseResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public Page<ExpenseResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    public ExpenseResponse getById(@NotNull UUID id) {
        Expense expense = repository.findById(id).orElse(null);
        if (expense == null) {
            throw new PumpBusinessException("EXPENSE_NOT_FOUND", "Expense with ID " + id + " not found");
        }
        return mapper.toResponse(expense);
    }

    public List<ExpenseResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getByExpenseHeadId(@NotNull UUID expenseHeadId) {
        return repository.findByExpenseHead_Id(expenseHeadId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getByExpenseType(@NotNull ExpenseType expenseType) {
        return repository.findByExpenseType(expenseType).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getByPumpMasterIdAndExpenseType(@NotNull UUID pumpMasterId, @NotNull ExpenseType expenseType) {
        return repository.findByPumpMaster_IdAndExpenseType(pumpMasterId, expenseType).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getBySalesmanNozzleShiftId(@NotNull UUID salesmanNozzleShiftId) {
        return repository.findBySalesmanNozzleShift_Id(salesmanNozzleShiftId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getByBankAccountId(@NotNull UUID bankAccountId) {
        return repository.findByBankAccount_Id(bankAccountId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getByDateRange(@NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        return repository.findByExpenseDateBetween(startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        return repository.findByPumpMaster_IdAndExpenseDateBetween(pumpMasterId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> searchExpenses(
            UUID pumpMasterId, UUID expenseHeadId, ExpenseType expenseType,
            UUID salesmanNozzleShiftId, UUID bankAccountId,
            LocalDate startDate, LocalDate endDate, String referenceNumber) {
        return repository.findBySearchCriteria(
                pumpMasterId, expenseHeadId, expenseType,
                salesmanNozzleShiftId, bankAccountId,
                startDate, endDate, referenceNumber)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public long countByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.countByPumpMasterId(pumpMasterId);
    }

    public long countByPumpMasterIdAndExpenseType(@NotNull UUID pumpMasterId, @NotNull ExpenseType expenseType) {
        return repository.countByPumpMasterIdAndExpenseType(pumpMasterId, expenseType);
    }

    public BigDecimal sumAmountByPumpMasterId(@NotNull UUID pumpMasterId) {
        BigDecimal sum = repository.sumAmountByPumpMasterId(pumpMasterId);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumAmountByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        BigDecimal sum = repository.sumAmountByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumAmountBySalesmanNozzleShiftId(@NotNull UUID salesmanNozzleShiftId) {
        BigDecimal sum = repository.sumAmountBySalesmanNozzleShiftId(salesmanNozzleShiftId);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumAmountByBankAccountIdAndDateRange(
            @NotNull UUID bankAccountId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        BigDecimal sum = repository.sumAmountByBankAccountIdAndDateRange(bankAccountId, startDate, endDate);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    @Transactional
    public ExpenseResponse create(@Valid CreateExpenseRequest request) {
        // Validate pump master
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate expense head
        ExpenseHead expenseHead = expenseHeadRepository.findById(request.getExpenseHeadId()).orElse(null);
        if (expenseHead == null) {
            throw new PumpBusinessException("INVALID_EXPENSE_HEAD",
                    "Expense head with ID " + request.getExpenseHeadId() + " does not exist");
        }

        // Validate expense type specific associations
        validateExpenseTypeAssociations(request.getExpenseType(), request.getSalesmanNozzleShiftId(),
                request.getBankAccountId());

        Expense expense = mapper.toEntity(request);
        expense.setPumpMaster(pumpMaster);
        expense.setExpenseHead(expenseHead);

        // Set associations based on expense type
        if (request.getExpenseType() == ExpenseType.NOZZLE_SHIFT && request.getSalesmanNozzleShiftId() != null) {
            SalesmanNozzleShift shift = salesmanNozzleShiftRepository.findById(request.getSalesmanNozzleShiftId())
                    .orElse(null);
            if (shift == null) {
                throw new PumpBusinessException("INVALID_NOZZLE_SHIFT",
                        "Salesman nozzle shift with ID " + request.getSalesmanNozzleShiftId() + " does not exist");
            }
            expense.setSalesmanNozzleShift(shift);
        } else if (request.getExpenseType() == ExpenseType.BANK_ACCOUNT && request.getBankAccountId() != null) {
            BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
            if (bankAccount == null) {
                throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                        "Bank account with ID " + request.getBankAccountId() + " does not exist");
            }
            expense.setBankAccount(bankAccount);
        }

        // Set file storage if provided
        if (request.getFileStorageId() != null) {
            FileStorage fileStorage = fileStorageRepository.findById(request.getFileStorageId()).orElse(null);
            if (fileStorage == null) {
                throw new PumpBusinessException("INVALID_FILE_STORAGE",
                        "File storage with ID " + request.getFileStorageId() + " does not exist");
            }
            expense.setFileStorage(fileStorage);
        }

        Expense savedExpense = repository.save(expense);

        // Create debit transaction in bank account when expense type is BANK_ACCOUNT
        if (savedExpense.getExpenseType() == ExpenseType.BANK_ACCOUNT && savedExpense.getBankAccount() != null) {
            BankTransaction bankTransaction = createBankDebitTransaction(savedExpense, request.getPaymentMethod());
            savedExpense.setBankTransaction(bankTransaction);
            savedExpense = repository.save(savedExpense);
        }

        return mapper.toResponse(savedExpense);
    }

    @Transactional
    public ExpenseResponse update(@NotNull UUID id, @Valid UpdateExpenseRequest request) {
        Expense existingExpense = repository.findById(id).orElse(null);
        if (existingExpense == null) {
            throw new PumpBusinessException("EXPENSE_NOT_FOUND", "Expense with ID " + id + " not found");
        }

        // Track old values for bank transaction handling
        ExpenseType oldExpenseType = existingExpense.getExpenseType();
        BankAccount oldBankAccount = existingExpense.getBankAccount();
        BigDecimal oldAmount = existingExpense.getAmount();
        BankTransaction oldBankTransaction = existingExpense.getBankTransaction();

        // Validate expense type specific associations if type is being changed
        if (request.getExpenseType() != null) {
            validateExpenseTypeAssociations(request.getExpenseType(), request.getSalesmanNozzleShiftId(),
                    request.getBankAccountId());
        }

        // Validate and set expense head if provided
        if (request.getExpenseHeadId() != null) {
            ExpenseHead expenseHead = expenseHeadRepository.findById(request.getExpenseHeadId()).orElse(null);
            if (expenseHead == null) {
                throw new PumpBusinessException("INVALID_EXPENSE_HEAD",
                        "Expense head with ID " + request.getExpenseHeadId() + " does not exist");
            }
            existingExpense.setExpenseHead(expenseHead);
        }

        // Update associations based on expense type
        if (request.getExpenseType() != null) {
            existingExpense.setExpenseType(request.getExpenseType());

            if (request.getExpenseType() == ExpenseType.NOZZLE_SHIFT) {
                if (request.getSalesmanNozzleShiftId() != null) {
                    SalesmanNozzleShift shift = salesmanNozzleShiftRepository
                            .findById(request.getSalesmanNozzleShiftId()).orElse(null);
                    if (shift == null) {
                        throw new PumpBusinessException("INVALID_NOZZLE_SHIFT",
                                "Salesman nozzle shift with ID " + request.getSalesmanNozzleShiftId()
                                + " does not exist");
                    }
                    existingExpense.setSalesmanNozzleShift(shift);
                }
                existingExpense.setBankAccount(null);
            } else if (request.getExpenseType() == ExpenseType.BANK_ACCOUNT) {
                if (request.getBankAccountId() != null) {
                    BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
                    if (bankAccount == null) {
                        throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                                "Bank account with ID " + request.getBankAccountId() + " does not exist");
                    }
                    existingExpense.setBankAccount(bankAccount);
                }
                existingExpense.setSalesmanNozzleShift(null);
            }
        }

        // Update other fields
        if (request.getExpenseDate() != null) {
            existingExpense.setExpenseDate(request.getExpenseDate());
        }
        if (request.getAmount() != null) {
            existingExpense.setAmount(request.getAmount());
        }
        if (request.getRemarks() != null) {
            existingExpense.setRemarks(request.getRemarks());
        }
        if (request.getReferenceNumber() != null) {
            existingExpense.setReferenceNumber(request.getReferenceNumber());
        }

        // Update file storage if provided
        if (request.getFileStorageId() != null) {
            FileStorage fileStorage = fileStorageRepository.findById(request.getFileStorageId()).orElse(null);
            if (fileStorage == null) {
                throw new PumpBusinessException("INVALID_FILE_STORAGE",
                        "File storage with ID " + request.getFileStorageId() + " does not exist");
            }
            existingExpense.setFileStorage(fileStorage);
        }

        // Handle bank transaction updates
        handleBankTransactionUpdate(existingExpense, oldExpenseType, oldBankAccount, oldAmount, oldBankTransaction, request.getPaymentMethod());

        Expense updatedExpense = repository.save(existingExpense);
        return mapper.toResponse(updatedExpense);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        Expense expense = repository.findById(id).orElse(null);
        if (expense == null) {
            throw new PumpBusinessException("EXPENSE_NOT_FOUND", "Expense with ID " + id + " not found");
        }

        // Delete associated bank transaction if exists
        BankTransaction bankTransaction = expense.getBankTransaction();
        if (bankTransaction != null) {
            expense.setBankTransaction(null);
            repository.save(expense); // Save to clear the relationship first
            bankTransactionRepository.delete(bankTransaction);
        }

        repository.delete(expense);
    }

    private void validateExpenseTypeAssociations(ExpenseType expenseType, UUID salesmanNozzleShiftId,
            UUID bankAccountId) {
        if (expenseType == ExpenseType.NOZZLE_SHIFT && salesmanNozzleShiftId == null) {
            throw new PumpBusinessException("INVALID_EXPENSE_ASSOCIATION",
                    "Salesman nozzle shift ID is required for NOZZLE_SHIFT expense type");
        }
        if (expenseType == ExpenseType.BANK_ACCOUNT && bankAccountId == null) {
            throw new PumpBusinessException("INVALID_EXPENSE_ASSOCIATION",
                    "Bank account ID is required for BANK_ACCOUNT expense type");
        }
    }

    /**
     * Creates a debit transaction in the bank account for the expense
     *
     * @param expense The expense entity
     * @param paymentMethod The payment method from the request (optional,
     * defaults to CASH)
     * @return The created BankTransaction entity
     */
    private BankTransaction createBankDebitTransaction(Expense expense, PaymentMethod paymentMethod) {
        CreateBankTransactionRequest transactionRequest = new CreateBankTransactionRequest();

        // Set bank account ID - required by DTO validation
        transactionRequest.setBankAccountId(expense.getBankAccount().getId());

        // Set transaction type to DEBIT - required by DTO validation
        transactionRequest.setTransactionType(com.reallink.pump.entities.BankTransaction.TransactionType.DEBIT);

        // Set amount
        transactionRequest.setAmount(expense.getAmount());

        // Set payment method from request or default to CASH
        transactionRequest.setPaymentMethod(paymentMethod != null ? paymentMethod : PaymentMethod.CASH);

        // Build description from expense details
        StringBuilder description = new StringBuilder();
        description.append("Expense: ").append(expense.getExpenseHead().getHeadName());
        if (expense.getRemarks() != null && !expense.getRemarks().isEmpty()) {
            description.append(" - ").append(expense.getRemarks());
        }
        if (expense.getReferenceNumber() != null && !expense.getReferenceNumber().isEmpty()) {
            description.append(" (Ref: ").append(expense.getReferenceNumber()).append(")");
        }
        transactionRequest.setDescription(description.toString());

        // Set transaction date to expense date
        transactionRequest.setTransactionDate(
                LocalDateTime.of(expense.getExpenseDate(), LocalDateTime.now().toLocalTime())
        );

        // Create debit transaction and get the response
        BankTransactionResponse response = bankTransactionService.createDebitTransaction(
                expense.getBankAccount().getId(),
                transactionRequest
        );

        // Fetch and return the actual BankTransaction entity
        return bankTransactionRepository.findById(response.getId())
                .orElse(null);
    }

    /**
     * Handles bank transaction updates when an expense is modified
     */
    private void handleBankTransactionUpdate(Expense expense, ExpenseType oldExpenseType,
            BankAccount oldBankAccount, BigDecimal oldAmount, BankTransaction oldBankTransaction, PaymentMethod paymentMethod) {

        ExpenseType newExpenseType = expense.getExpenseType();
        BankAccount newBankAccount = expense.getBankAccount();
        BigDecimal newAmount = expense.getAmount();

        // Case 1: Changed from BANK_ACCOUNT to NOZZLE_SHIFT - delete old transaction
        if (oldExpenseType == ExpenseType.BANK_ACCOUNT && newExpenseType == ExpenseType.NOZZLE_SHIFT) {
            if (oldBankTransaction != null) {
                expense.setBankTransaction(null);
                bankTransactionRepository.delete(oldBankTransaction);
            }
            return;
        }

        // Case 2: Changed from NOZZLE_SHIFT to BANK_ACCOUNT - create new transaction
        if (oldExpenseType == ExpenseType.NOZZLE_SHIFT && newExpenseType == ExpenseType.BANK_ACCOUNT) {
            if (newBankAccount != null) {
                BankTransaction newTransaction = createBankDebitTransaction(expense, paymentMethod);
                expense.setBankTransaction(newTransaction);
            }
            return;
        }

        // Case 3: Still BANK_ACCOUNT - update the existing transaction
        if (newExpenseType == ExpenseType.BANK_ACCOUNT && newBankAccount != null) {
            if (oldBankTransaction != null) {
                // Update the existing transaction
                oldBankTransaction.setAmount(newAmount);
                oldBankTransaction.setBankAccount(newBankAccount);

                // Update payment method if provided
                if (paymentMethod != null) {
                    oldBankTransaction.setPaymentMethod(paymentMethod);
                }

                // Update description
                StringBuilder description = new StringBuilder();
                description.append("Expense: ").append(expense.getExpenseHead().getHeadName());
                if (expense.getRemarks() != null && !expense.getRemarks().isEmpty()) {
                    description.append(" - ").append(expense.getRemarks());
                }
                if (expense.getReferenceNumber() != null && !expense.getReferenceNumber().isEmpty()) {
                    description.append(" (Ref: ").append(expense.getReferenceNumber()).append(")");
                }
                oldBankTransaction.setDescription(description.toString());

                // Update transaction date
                oldBankTransaction.setTransactionDate(
                        LocalDateTime.of(expense.getExpenseDate(), oldBankTransaction.getTransactionDate().toLocalTime())
                );

                // Save the updated transaction
                bankTransactionRepository.save(oldBankTransaction);
            } else {
                // No existing transaction, create new one
                BankTransaction newTransaction = createBankDebitTransaction(expense, paymentMethod);
                expense.setBankTransaction(newTransaction);
            }
        }
    }
}
