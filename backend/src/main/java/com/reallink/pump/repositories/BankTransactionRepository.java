package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.BankTransaction;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, UUID> {

    List<BankTransaction> findByBankAccountIdOrderByTransactionDateDesc(UUID bankAccountId);

    List<BankTransaction> findByBankAccountIdAndTransactionDateBetweenOrderByTransactionDateAsc(UUID bankAccountId, java.time.LocalDateTime fromDateTime, java.time.LocalDateTime toDateTime);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.transactionType = com.reallink.pump.entities.BankTransaction.TransactionType.CREDIT THEN t.amount ELSE -t.amount END), 0) "
            + "FROM BankTransaction t WHERE t.bankAccount.id = :bankAccountId")
    BigDecimal getBalanceByBankAccountId(@Param("bankAccountId") UUID bankAccountId);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.transactionType = com.reallink.pump.entities.BankTransaction.TransactionType.CREDIT THEN t.amount ELSE -t.amount END), 0) "
            + "FROM BankTransaction t WHERE t.bankAccount.id = :bankAccountId AND DATE(t.transactionDate) = :date")
    BigDecimal getDailyNetByBankAccountIdAndDate(@Param("bankAccountId") UUID bankAccountId, @Param("date") LocalDate date);

    /**
     * Find all cash distribution transactions for a shift accounting
     */
    List<BankTransaction> findByShiftAccountingIdOrderByCreatedAtDesc(UUID shiftAccountingId);

    /**
     * Delete all cash distribution transactions for a shift accounting
     */
    @Modifying
    @Query("DELETE FROM BankTransaction t WHERE t.shiftAccounting.id = :shiftAccountingId")
    void deleteByShiftAccountingId(@Param("shiftAccountingId") UUID shiftAccountingId);

    /**
     * Get total distributed amount for a shift accounting
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM BankTransaction t WHERE t.shiftAccounting.id = :shiftAccountingId")
    BigDecimal getTotalDistributedByShiftAccountingId(@Param("shiftAccountingId") UUID shiftAccountingId);
}
