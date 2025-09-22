package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.DailyClosingBalance;

@Repository
public interface DailyClosingBalanceRepository extends JpaRepository<DailyClosingBalance, UUID> {

    Optional<DailyClosingBalance> findByBankAccount_IdAndDate(UUID bankAccountId, LocalDate date);

    @Query("SELECT dcb FROM DailyClosingBalance dcb WHERE dcb.bankAccount.id = :bankAccountId AND dcb.date <= :date ORDER BY dcb.date DESC")
    Optional<DailyClosingBalance> findLatestByBankAccountIdAndDateBeforeOrEqual(@Param("bankAccountId") UUID bankAccountId, @Param("date") LocalDate date);

    Optional<DailyClosingBalance> findTopByBankAccountIdAndDateLessThanOrderByDateDesc(UUID bankAccountId, LocalDate date);

    @Modifying
    @Query("UPDATE DailyClosingBalance dcb SET dcb.dailyNet = :dailyNet WHERE dcb.bankAccount.id = :bankAccountId AND dcb.date = :date")
    int updateDailyNet(@Param("bankAccountId") UUID bankAccountId, @Param("date") LocalDate date, @Param("dailyNet") BigDecimal dailyNet);

    @Query("SELECT COALESCE(SUM(dcb.dailyNet), 0) FROM DailyClosingBalance dcb WHERE dcb.bankAccount.id = :bankAccountId AND dcb.date <= :date")
    BigDecimal getCumulativeNetUpToDate(@Param("bankAccountId") UUID bankAccountId, @Param("date") LocalDate date);
}
