package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.NozzleAssignment;

@Repository
public interface NozzleAssignmentRepository extends JpaRepository<NozzleAssignment, UUID> {

    /**
     * Find all nozzle assignments for a specific shift. Used to display all
     * nozzles a salesman managed during a shift.
     */
    List<NozzleAssignment> findBySalesmanShiftIdOrderByStartTimeDesc(UUID shiftId);

    /**
     * Find a nozzle assignment for a specific shift and nozzle.
     */
    Optional<NozzleAssignment> findBySalesmanShiftIdAndNozzleId(UUID shiftId, UUID nozzleId);

    /**
     * Find an open assignment for a specific nozzle. Used to check if a nozzle
     * is currently assigned to any shift.
     */
    @Query("SELECT na FROM NozzleAssignment na WHERE na.nozzle.id = :nozzleId "
            + "AND na.status = 'OPEN' AND na.pumpMaster.id = :pumpMasterId")
    Optional<NozzleAssignment> findOpenAssignmentForNozzle(
            @Param("nozzleId") UUID nozzleId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    /**
     * Check if a nozzle is currently assigned (open status).
     */
    @Query("SELECT COUNT(na) > 0 FROM NozzleAssignment na WHERE na.nozzle.id = :nozzleId "
            + "AND na.status = 'OPEN' AND na.pumpMaster.id = :pumpMasterId")
    boolean isNozzleCurrentlyAssigned(
            @Param("nozzleId") UUID nozzleId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    /**
     * Find all assignments for a specific nozzle (history).
     */
    List<NozzleAssignment> findByNozzleIdAndPumpMasterIdOrderByStartTimeDesc(
            UUID nozzleId,
            UUID pumpMasterId
    );

    /**
     * Find all open assignments for a shift. Used to check if all nozzles are
     * closed before closing a shift.
     */
    @Query("SELECT na FROM NozzleAssignment na WHERE na.salesmanShift.id = :shiftId "
            + "AND na.status = 'OPEN'")
    List<NozzleAssignment> findOpenAssignmentsByShiftId(@Param("shiftId") UUID shiftId);

    /**
     * Count open assignments for a shift.
     */
    @Query("SELECT COUNT(na) FROM NozzleAssignment na WHERE na.salesmanShift.id = :shiftId "
            + "AND na.status = 'OPEN'")
    long countOpenAssignmentsByShiftId(@Param("shiftId") UUID shiftId);

    /**
     * Calculate total fuel dispensed across all nozzle assignments in a time
     * period. This is calculated as the sum of (closingBalance -
     * openingBalance) for all closed assignments within the period.
     */
    @Query("SELECT COALESCE(SUM(na.closingBalance - na.openingBalance), 0) "
            + "FROM NozzleAssignment na "
            + "WHERE na.pumpMaster.id = :pumpMasterId "
            + "AND na.status = 'CLOSED' "
            + "AND na.startTime >= :startDate "
            + "AND na.endTime <= :endDate")
    BigDecimal findTotalFuelDispensedInPeriod(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
