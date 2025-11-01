package com.reallink.pump.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanShiftAccounting;

@Repository
public interface SalesmanShiftAccountingRepository extends JpaRepository<SalesmanShiftAccounting, UUID> {

    /**
     * Find accounting record for a specific salesman shift.
     */
    Optional<SalesmanShiftAccounting> findBySalesmanShiftId(UUID shiftId);

    /**
     * Check if accounting exists for a shift.
     */
    boolean existsBySalesmanShiftId(UUID shiftId);

    /**
     * Find all accounting records for shifts within a date range for a specific
     * pump master. Uses the shift's start datetime for filtering.
     */
    @Query("SELECT sa FROM SalesmanShiftAccounting sa "
            + "WHERE sa.salesmanShift.pumpMaster.id = :pumpMasterId "
            + "AND sa.salesmanShift.startDatetime >= :startDate "
            + "AND sa.salesmanShift.startDatetime <= :endDate "
            + "ORDER BY sa.salesmanShift.startDatetime DESC")
    List<SalesmanShiftAccounting> findByPumpMasterIdAndDateRange(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
