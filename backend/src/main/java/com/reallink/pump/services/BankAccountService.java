package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateBankAccountRequest;
import com.reallink.pump.dto.request.UpdateBankAccountRequest;
import com.reallink.pump.dto.response.BankAccountResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.DailyClosingBalance;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.BankAccountMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.DailyClosingBalanceRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BankAccountService {

    private final BankAccountRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final BankAccountMapper mapper;
    private final BankTransactionService bankTransactionService;
    private final DailyClosingBalanceRepository dailyClosingBalanceRepository;

    public List<BankAccountResponse> getAll() {
        return repository.findAll().stream()
                .map(bankAccount -> {
                    BankAccountResponse response = mapper.toResponse(bankAccount);
                    setCurrentBalance(response, bankAccount);
                    return response;
                })
                .toList();
    }

    public Page<BankAccountResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    public BankAccountResponse getById(@NotNull UUID id) {
        BankAccount bankAccount = repository.findById(id).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND", "Bank account with ID " + id + " not found");
        }
        BankAccountResponse response = mapper.toResponse(bankAccount);
        setCurrentBalance(response, bankAccount);
        return response;
    }

    public List<BankAccountResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public BankAccountResponse getByAccountNumberAndPumpMasterId(@NotNull String accountNumber, @NotNull UUID pumpMasterId) {
        BankAccount bankAccount = repository.findByAccountNumberAndPumpMaster_Id(accountNumber, pumpMasterId).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND",
                    "Bank account with number '" + accountNumber + "' and pump master ID " + pumpMasterId + " not found");
        }
        return mapper.toResponse(bankAccount);
    }

    public List<BankAccountResponse> getByBankAndPumpMasterId(@NotNull String bank, @NotNull UUID pumpMasterId) {
        return repository.findByBankAndPumpMaster_Id(bank, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<BankAccountResponse> getByIfscCodeAndPumpMasterId(@NotNull String ifscCode, @NotNull UUID pumpMasterId) {
        return repository.findByIfscCodeAndPumpMaster_Id(ifscCode, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<BankAccountResponse> searchBankAccounts(String accountHolderName, String accountNumber,
            String ifscCode, String bank, String branch, UUID pumpMasterId) {
        return repository
                .findBySearchCriteria(accountHolderName, accountNumber, ifscCode, bank, branch, pumpMasterId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<BankAccountResponse> getByAccountHolderNameContaining(@NotNull String accountHolderName) {
        return repository.findByAccountHolderNameContainingIgnoreCase(accountHolderName).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public BankAccountResponse create(@Valid CreateBankAccountRequest request) {
        // Check for duplicate account number
        if (repository.existsByAccountNumberAndPumpMaster_Id(request.getAccountNumber(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_BANK_ACCOUNT",
                    "Bank account with number '" + request.getAccountNumber() + "' already exists for this pump master");
        }
        // Fetch the PumpInfoMaster entity using pumpMasterId from the request
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }
        BankAccount bankAccount = mapper.toEntity(request);
        bankAccount.setPumpMaster(pumpMaster);
        BankAccount savedBankAccount = repository.save(bankAccount);
        BankAccountResponse response = mapper.toResponse(savedBankAccount);
        setCurrentBalance(response, savedBankAccount);
        return response;
    }

    @Transactional
    public BankAccountResponse update(@NotNull UUID id, @Valid UpdateBankAccountRequest request) {
        BankAccount existingBankAccount = repository.findById(id).orElse(null);
        if (existingBankAccount == null) {
            throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND", "Bank account with ID " + id + " not found");
        }

        // Check for duplicate account number if number is being updated
        if (request.getAccountNumber() != null
                && !request.getAccountNumber().equals(existingBankAccount.getAccountNumber())
                && repository.existsByAccountNumberAndPumpMaster_IdAndIdNot(request.getAccountNumber(),
                        existingBankAccount.getPumpMaster().getId(), id)) {
            throw new PumpBusinessException("DUPLICATE_BANK_ACCOUNT",
                    "Bank account with number '" + request.getAccountNumber() + "' already exists for this pump master");
        }

        mapper.updateEntityFromRequest(request, existingBankAccount);
        BankAccount updatedBankAccount = repository.save(existingBankAccount);
        BankAccountResponse response = mapper.toResponse(updatedBankAccount);
        setCurrentBalance(response, updatedBankAccount);
        return response;
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND", "Bank account with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public boolean existsByAccountNumberAndPumpMasterId(@NotNull String accountNumber, @NotNull UUID pumpMasterId) {
        return repository.existsByAccountNumberAndPumpMaster_Id(accountNumber, pumpMasterId);
    }

    public long getCountByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.countByPumpMasterId(pumpMasterId);
    }

    private void setCurrentBalance(BankAccountResponse response, BankAccount bankAccount) {
        Optional<DailyClosingBalance> latestBalance = dailyClosingBalanceRepository.findLatestByBankAccountIdAndDateBeforeOrEqual(bankAccount.getId(), LocalDate.now());
        if (latestBalance.isPresent()) {
            response.setCurrentBalance(latestBalance.get().getClosingBalance());
        } else {
            BigDecimal transactionSum = bankTransactionService.getBalanceByBankAccountId(bankAccount.getId());
            response.setCurrentBalance(bankAccount.getOpeningBalance().add(transactionSum));
        }
    }
}
