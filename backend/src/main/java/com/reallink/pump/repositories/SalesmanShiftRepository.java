package com.reallink.pump.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanShift;

@Repository
public interface SalesmanShiftRepository extends JpaRepository<SalesmanShift, UUID> {

    /**
     * Find an open shift for a specific salesman. Used to check if a salesman
     * already has an active shift before starting a new one.
     */
    Optional<SalesmanShift> findBySalesmanIdAndStatusAndPumpMasterId(
            UUID salesmanId,
            SalesmanShift.ShiftStatus status,
            UUID pumpMasterId
    );

    /**
     * Check if a salesman has an open shift.
     */
    boolean existsBySalesmanIdAndStatusAndPumpMasterId(
            UUID salesmanId,
            SalesmanShift.ShiftStatus status,
            UUID pumpMasterId
    );

    /**
     * Find all shifts for a pump master within a date range. Used for reports
     * and shift history.
     */
    @Query("SELECT s FROM SalesmanShift s WHERE s.pumpMaster.id = :pumpMasterId "
            + "AND s.startDatetime >= :fromDate AND s.startDatetime <= :toDate "
            + "ORDER BY s.startDatetime DESC")
    List<SalesmanShift> findByPumpMasterIdAndDateRange(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    /**
     * Find all shifts for a specific salesman.
     */
    List<SalesmanShift> findBySalesmanIdAndPumpMasterIdOrderByStartDatetimeDesc(
            UUID salesmanId,
            UUID pumpMasterId
    );

    /**
     * Find all shifts by pump master and status.
     */
    List<SalesmanShift> findByPumpMasterIdAndStatusOrderByStartDatetimeDesc(
            UUID pumpMasterId,
            SalesmanShift.ShiftStatus status
    );

    /**
     * Find all open shifts for a pump master.
     */
    @Query("SELECT s FROM SalesmanShift s WHERE s.pumpMaster.id = :pumpMasterId "
            + "AND s.status = 'OPEN' ORDER BY s.startDatetime DESC")
    List<SalesmanShift> findOpenShiftsByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    /**
     * Find shifts requiring accounting (closed but accounting not done).
     */
    @Query("SELECT s FROM SalesmanShift s WHERE s.pumpMaster.id = :pumpMasterId "
            + "AND s.status = 'CLOSED' AND s.isAccountingDone = false "
            + "ORDER BY s.endDatetime DESC")
    List<SalesmanShift> findShiftsNeedingAccounting(@Param("pumpMasterId") UUID pumpMasterId);
}
