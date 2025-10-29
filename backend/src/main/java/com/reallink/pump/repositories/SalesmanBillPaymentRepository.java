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

import com.reallink.pump.entities.SalesmanBillPayment;

@Repository
public interface SalesmanBillPaymentRepository extends JpaRepository<SalesmanBillPayment, UUID> {

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman")
    List<SalesmanBillPayment> findAllWithRelations();

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman "
            + "WHERE sbp.id = :id")
    SalesmanBillPayment findByIdWithRelations(@Param("id") UUID id);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman "
            + "WHERE sbp.pumpMaster.id = :pumpMasterId")
    List<SalesmanBillPayment> findByPumpMaster_Id(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman "
            + "WHERE sbp.salesmanShift.id = :shiftId")
    List<SalesmanBillPayment> findBySalesmanShiftId(@Param("shiftId") UUID shiftId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman "
            + "WHERE sbp.customer.id = :customerId")
    List<SalesmanBillPayment> findByCustomer_Id(@Param("customerId") UUID customerId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman "
            + "WHERE DATE(sbp.paymentDate) >= :fromDate AND DATE(sbp.paymentDate) <= :toDate "
            + "ORDER BY sbp.paymentDate ASC")
    List<SalesmanBillPayment> findByPaymentDateRange(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman "
            + "WHERE sbp.paymentDate BETWEEN :startDate AND :endDate")
    List<SalesmanBillPayment> findByPaymentDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(sbp.amount), 0) FROM SalesmanBillPayment sbp WHERE sbp.salesmanShift.id = :shiftId")
    BigDecimal getTotalPaymentsForShift(@Param("shiftId") UUID shiftId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.salesmanShift ss "
            + "LEFT JOIN FETCH ss.salesman "
            + "WHERE sbp.salesmanShift.id = :shiftId "
            + "ORDER BY sbp.paymentDate DESC")
    List<SalesmanBillPayment> findBySalesmanShiftIdOrderByPaymentDateDesc(@Param("shiftId") UUID shiftId);
}
