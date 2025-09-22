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

import com.reallink.pump.entities.DailyTankLevel;

@Repository
public interface DailyTankLevelRepository extends JpaRepository<DailyTankLevel, UUID> {

    Optional<DailyTankLevel> findByTank_IdAndDate(UUID tankId, LocalDate date);

    @Query("SELECT dtl FROM DailyTankLevel dtl WHERE dtl.tank.id = :tankId AND dtl.date <= :date ORDER BY dtl.date DESC")
    Optional<DailyTankLevel> findLatestByTankIdAndDateBeforeOrEqual(@Param("tankId") UUID tankId, @Param("date") LocalDate date);

    @Modifying
    @Query("UPDATE DailyTankLevel dtl SET dtl.closingLevel = :closingLevel WHERE dtl.tank.id = :tankId AND dtl.date = :date")
    int updateClosingLevel(@Param("tankId") UUID tankId, @Param("date") LocalDate date, @Param("closingLevel") BigDecimal closingLevel);
}
