package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateBankTransactionRequest;
import com.reallink.pump.dto.response.BankTransactionResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.BankTransaction.TransactionType;
import com.reallink.pump.entities.DailyClosingBalance;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.BankTransactionMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.BankTransactionRepository;
import com.reallink.pump.repositories.DailyClosingBalanceRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BankTransactionService {

    private final BankTransactionRepository transactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final BankTransactionMapper mapper;
    private final DailyClosingBalanceRepository dailyClosingBalanceRepository;

    public List<BankTransactionResponse> getTransactionsByBankAccountId(@NotNull UUID bankAccountId) {
        List<BankTransaction> transactions = transactionRepository.findByBankAccountIdOrderByTransactionDateDesc(bankAccountId);
        return mapper.toResponseList(transactions);
    }

    public List<BankTransactionResponse> getTransactionsByBankAccountIdAndDateRange(
            UUID bankAccountId, LocalDate fromDate, LocalDate toDate) {
        List<BankTransaction> transactions = transactionRepository
                .findByBankAccountIdAndTransactionDateBetweenOrderByTransactionDateAsc(
                        bankAccountId, fromDate.atStartOfDay(), toDate.atTime(23, 59, 59));
        return transactions.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getBalanceByBankAccountId(@NotNull UUID bankAccountId) {
        return transactionRepository.getBalanceByBankAccountId(bankAccountId);
    }

    @Transactional
    public BankTransactionResponse createCreditTransaction(@NotNull UUID bankAccountId, @Valid CreateBankTransactionRequest request) {
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND", "Bank account with ID " + bankAccountId + " not found");
        }
        BankTransaction transaction = mapper.toEntity(request);
        transaction.setBankAccount(bankAccount);
        transaction.setTransactionType(TransactionType.CREDIT);
        transaction.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        BankTransaction saved = transactionRepository.save(transaction);
        updateDailyClosingBalance(saved);
        return mapper.toResponse(saved);
    }

    @Transactional
    public BankTransactionResponse createDebitTransaction(@NotNull UUID bankAccountId, @Valid CreateBankTransactionRequest request) {
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("BANK_ACCOUNT_NOT_FOUND", "Bank account with ID " + bankAccountId + " not found");
        }
        BankTransaction transaction = mapper.toEntity(request);
        transaction.setBankAccount(bankAccount);
        transaction.setTransactionType(TransactionType.DEBIT);
        transaction.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        BankTransaction saved = transactionRepository.save(transaction);
        updateDailyClosingBalance(saved);
        return mapper.toResponse(saved);
    }

    private void updateDailyClosingBalance(BankTransaction transaction) {
        LocalDate date = transaction.getTransactionDate().toLocalDate();
        BigDecimal dailyNet = transactionRepository.getDailyNetByBankAccountIdAndDate(transaction.getBankAccount().getId(), date);
        DailyClosingBalance dailyBalance = dailyClosingBalanceRepository.findByBankAccount_IdAndDate(transaction.getBankAccount().getId(), date)
                .orElse(new DailyClosingBalance());
        dailyBalance.setBankAccount(transaction.getBankAccount());
        dailyBalance.setDate(date);
        dailyBalance.setDailyNet(dailyNet);
        dailyClosingBalanceRepository.save(dailyBalance);
    }
}
