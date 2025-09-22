package com.reallink.pump.repositories;

import java.math.BigDecimal;
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

    @Query("SELECT COALESCE(SUM(CASE WHEN t.transactionType = 'ADDITION' THEN t.amount ELSE -t.amount END), 0) "
            + "FROM TankTransaction t WHERE t.tank.id = :tankId")
    BigDecimal getLevelChangeByTankId(@Param("tankId") UUID tankId);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.transactionType = 'ADDITION' THEN t.amount ELSE -t.amount END), 0) "
            + "FROM TankTransaction t WHERE t.tank.id = :tankId AND DATE(t.transactionDate) <= :date")
    BigDecimal getLevelChangeByTankIdAndDate(@Param("tankId") UUID tankId, @Param("date") LocalDateTime date);
}
