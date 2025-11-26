package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.EmployeeSalaryPayment;

@Repository
public interface EmployeeSalaryPaymentRepository extends JpaRepository<EmployeeSalaryPayment, UUID> {

    @Query("SELECT esp FROM EmployeeSalaryPayment esp "
            + "WHERE esp.pumpMaster.id = :pumpMasterId "
            + "ORDER BY esp.paymentDate DESC")
    List<EmployeeSalaryPayment> findByPumpMasterIdOrderByPaymentDateDesc(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT esp FROM EmployeeSalaryPayment esp "
            + "WHERE esp.user.id = :userId AND esp.pumpMaster.id = :pumpMasterId "
            + "ORDER BY esp.paymentDate DESC")
    List<EmployeeSalaryPayment> findByUserIdAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT esp FROM EmployeeSalaryPayment esp "
            + "WHERE esp.calculatedSalary.id = :calculatedSalaryId "
            + "AND esp.pumpMaster.id = :pumpMasterId "
            + "ORDER BY esp.paymentDate DESC")
    List<EmployeeSalaryPayment> findByCalculatedSalaryIdAndPumpMasterId(
            @Param("calculatedSalaryId") UUID calculatedSalaryId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT esp FROM EmployeeSalaryPayment esp "
            + "WHERE esp.calculatedSalary IS NULL "
            + "AND esp.pumpMaster.id = :pumpMasterId "
            + "ORDER BY esp.paymentDate DESC")
    List<EmployeeSalaryPayment> findAdvancePaymentsByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COALESCE(SUM(esp.amount), 0) FROM EmployeeSalaryPayment esp "
            + "WHERE esp.calculatedSalary.id = :calculatedSalaryId "
            + "AND esp.pumpMaster.id = :pumpMasterId")
    BigDecimal getTotalPaidAmountByCalculatedSalaryIdAndPumpMasterId(
            @Param("calculatedSalaryId") UUID calculatedSalaryId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT COALESCE(SUM(esp.amount), 0) FROM EmployeeSalaryPayment esp "
            + "WHERE esp.user.id = :userId "
            + "AND esp.pumpMaster.id = :pumpMasterId")
    BigDecimal getTotalPaidAmountByUserIdAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT COALESCE(SUM(esp.amount), 0) FROM EmployeeSalaryPayment esp "
            + "WHERE esp.pumpMaster.id = :pumpMasterId "
            + "AND esp.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal findTotalPaymentsInPeriod(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Ledger-specific queries
    @Query("SELECT esp FROM EmployeeSalaryPayment esp "
            + "WHERE esp.user.id = :userId "
            + "AND esp.paymentDate < :beforeDate "
            + "ORDER BY esp.paymentDate ASC")
    List<EmployeeSalaryPayment> findByUserIdAndPaymentDateBefore(
            @Param("userId") UUID userId,
            @Param("beforeDate") LocalDateTime beforeDate
    );

    @Query("SELECT esp FROM EmployeeSalaryPayment esp "
            + "WHERE esp.user.id = :userId "
            + "AND esp.paymentDate BETWEEN :fromDate AND :toDate "
            + "ORDER BY esp.paymentDate ASC")
    List<EmployeeSalaryPayment> findByUserIdAndPaymentDateBetween(
            @Param("userId") UUID userId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
