package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanBill;

@Repository
public interface SalesmanBillRepository extends JpaRepository<SalesmanBill, UUID> {

    boolean existsByBillNoAndPumpMaster_Id(Long billNo, UUID pumpMasterId);

    @Query("SELECT MAX(b.billNo) FROM SalesmanBill b WHERE b.pumpMaster.id = :pumpMasterId")
    Long findMaxBillNoByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    List<SalesmanBill> findByPumpMasterIdOrderByBillDateDesc(UUID pumpMasterId);

    List<SalesmanBill> findByPumpMasterIdAndBillDateBetweenOrderByBillDateDesc(UUID pumpMasterId, LocalDate startDate, LocalDate endDate);

    List<SalesmanBill> findByCustomer_Id(UUID customerId);

    /**
     * Find all bills for a specific salesman shift.
     */
    List<SalesmanBill> findBySalesmanShiftIdOrderByBillDateDesc(UUID salesmanShiftId);

    /**
     * Calculate total credit given during a shift.
     */
    @Query("SELECT COALESCE(SUM(b.netAmount), 0) FROM SalesmanBill b WHERE b.salesmanShift.id = :shiftId")
    BigDecimal getTotalCreditForShift(@Param("shiftId") UUID shiftId);

    /**
     * Find bills by nozzle (for reporting).
     */
    List<SalesmanBill> findByNozzleIdOrderByBillDateDesc(UUID nozzleId);
}
