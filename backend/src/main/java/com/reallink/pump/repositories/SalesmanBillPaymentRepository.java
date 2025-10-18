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

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman")
    List<SalesmanBillPayment> findAllWithRelations();

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman "
            + "WHERE sbp.id = :id")
    SalesmanBillPayment findByIdWithRelations(@Param("id") UUID id);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman "
            + "WHERE sbp.pumpMaster.id = :pumpMasterId")
    List<SalesmanBillPayment> findByPumpMaster_Id(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman "
            + "WHERE sbp.salesmanNozzleShift.id = :shiftId")
    List<SalesmanBillPayment> findBySalesmanNozzleShift_Id(@Param("shiftId") UUID shiftId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman "
            + "WHERE sbp.customer.id = :customerId")
    List<SalesmanBillPayment> findByCustomer_Id(@Param("customerId") UUID customerId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman "
            + "WHERE sbp.bankAccount.id = :bankAccountId")
    List<SalesmanBillPayment> findByBankAccount_Id(@Param("bankAccountId") UUID bankAccountId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman "
            + "WHERE sbp.paymentDate BETWEEN :startDate AND :endDate")
    List<SalesmanBillPayment> findByPaymentDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(sbp.amount), 0) FROM SalesmanBillPayment sbp WHERE sbp.salesmanNozzleShift.id = :shiftId")
    BigDecimal getTotalPaymentsForShift(@Param("shiftId") UUID shiftId);

    @Query("SELECT sbp FROM SalesmanBillPayment sbp "
            + "LEFT JOIN FETCH sbp.customer "
            + "LEFT JOIN FETCH sbp.bankAccount "
            + "LEFT JOIN FETCH sbp.salesmanNozzleShift sns "
            + "LEFT JOIN FETCH sns.salesman "
            + "WHERE sbp.salesmanNozzleShift.id = :shiftId "
            + "ORDER BY sbp.paymentDate DESC")
    List<SalesmanBillPayment> findBySalesmanNozzleShiftIdOrderByPaymentDateDesc(@Param("shiftId") UUID shiftId);
}
