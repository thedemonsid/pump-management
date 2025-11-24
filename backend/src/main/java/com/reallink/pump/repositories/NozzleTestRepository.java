package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.NozzleTest;

@Repository
public interface NozzleTestRepository extends JpaRepository<NozzleTest, UUID> {

    /**
     * Find all nozzle tests for a specific shift.
     */
    List<NozzleTest> findBySalesmanShiftIdOrderByTestDatetimeDesc(UUID shiftId);

    /**
     * Find all nozzle tests for a specific nozzle assignment.
     */
    List<NozzleTest> findByNozzleAssignmentIdOrderByTestDatetimeDesc(UUID assignmentId);

    /**
     * Calculate total test quantity for a specific nozzle assignment.
     */
    @Query("SELECT COALESCE(SUM(nt.testQuantity), 0) FROM NozzleTest nt WHERE nt.nozzleAssignment.id = :assignmentId")
    BigDecimal sumTestQuantityByNozzleAssignment(@Param("assignmentId") UUID assignmentId);

    /**
     * Calculate total test quantity for a specific shift.
     */
    @Query("SELECT COALESCE(SUM(nt.testQuantity), 0) FROM NozzleTest nt WHERE nt.salesmanShift.id = :shiftId")
    BigDecimal sumTestQuantityByShift(@Param("shiftId") UUID shiftId);

    /**
     * Count tests for a specific nozzle assignment.
     */
    long countByNozzleAssignmentId(UUID assignmentId);

    /**
     * Count tests for a specific shift.
     */
    long countBySalesmanShiftId(UUID shiftId);

    /**
     * Check if a nozzle assignment has any tests.
     */
    boolean existsByNozzleAssignmentId(UUID assignmentId);
}
