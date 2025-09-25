package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanBillPayment;

@Repository
public interface SalesmanBillPaymentRepository extends JpaRepository<SalesmanBillPayment, UUID> {

    List<SalesmanBillPayment> findByPumpMaster_Id(UUID pumpMasterId);

    List<SalesmanBillPayment> findBySalesmanNozzleShift_Id(UUID salesmanNozzleShiftId);

    List<SalesmanBillPayment> findByCustomer_Id(UUID customerId);

    List<SalesmanBillPayment> findByBankAccount_Id(UUID bankAccountId);

    List<SalesmanBillPayment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(sbp.amount), 0) FROM SalesmanBillPayment sbp WHERE sbp.salesmanNozzleShift.id = :shiftId")
    BigDecimal getTotalPaymentsForShift(@Param("shiftId") UUID shiftId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp WHERE sbp.salesmanNozzleShift.id = :shiftId ORDER BY sbp.paymentDate DESC")
    List<SalesmanBillPayment> findBySalesmanNozzleShiftIdOrderByPaymentDateDesc(@Param("shiftId") UUID shiftId);
}
