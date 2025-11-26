package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.TankTransaction;

@Repository
public interface TankTransactionRepository extends JpaRepository<TankTransaction, UUID> {

    List<TankTransaction> findByTankIdOrderByTransactionDateDesc(UUID tankId);

    List<TankTransaction> findByTankIdAndTransactionDateBetweenOrderByTransactionDateAsc(UUID tankId, LocalDateTime fromDateTime, LocalDateTime toDateTime);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.transactionType = com.reallink.pump.entities.TankTransaction.TransactionType.ADDITION THEN t.volume ELSE -t.volume END), 0) "
            + "FROM TankTransaction t WHERE t.tank.id = :tankId")
    BigDecimal getLevelChangeByTankId(@Param("tankId") UUID tankId);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.transactionType = com.reallink.pump.entities.TankTransaction.TransactionType.ADDITION THEN t.volume ELSE -t.volume END), 0) "
            + "FROM TankTransaction t WHERE t.tank.id = :tankId AND DATE(t.transactionDate) <= :date")
    BigDecimal getLevelChangeByTankIdAndDate(@Param("tankId") UUID tankId, @Param("date") LocalDateTime date);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.transactionType = com.reallink.pump.entities.TankTransaction.TransactionType.ADDITION THEN t.volume ELSE -t.volume END), 0) "
            + "FROM TankTransaction t WHERE t.tank.id = :tankId AND DATE(t.transactionDate) = :date")
    BigDecimal getDailyNetByTankIdAndDate(@Param("tankId") UUID tankId, @Param("date") LocalDate date);

    List<TankTransaction> findByNozzleTest(com.reallink.pump.entities.NozzleTest nozzleTest);
}
