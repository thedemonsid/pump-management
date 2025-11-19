package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.CalculatedSalary;

@Repository
public interface CalculatedSalaryRepository extends JpaRepository<CalculatedSalary, UUID> {

    @Query("SELECT cs FROM CalculatedSalary cs "
            + "WHERE cs.pumpMaster.id = :pumpMasterId "
            + "ORDER BY cs.calculationDate DESC, cs.fromDate DESC")
    List<CalculatedSalary> findByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT cs FROM CalculatedSalary cs "
            + "WHERE cs.user.id = :userId AND cs.pumpMaster.id = :pumpMasterId "
            + "ORDER BY cs.calculationDate DESC, cs.fromDate DESC")
    List<CalculatedSalary> findByUserIdAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT cs FROM CalculatedSalary cs "
            + "WHERE cs.calculationDate BETWEEN :startDate AND :endDate "
            + "AND cs.pumpMaster.id = :pumpMasterId "
            + "ORDER BY cs.calculationDate DESC")
    List<CalculatedSalary> findByCalculationDateBetweenAndPumpMasterId(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT cs FROM CalculatedSalary cs "
            + "WHERE cs.fromDate <= :date AND cs.toDate >= :date "
            + "AND cs.user.id = :userId "
            + "AND cs.pumpMaster.id = :pumpMasterId")
    List<CalculatedSalary> findByUserIdAndDateRangeAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("date") LocalDate date,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT COALESCE(SUM(cs.netSalary), 0) FROM CalculatedSalary cs "
            + "WHERE cs.user.id = :userId AND cs.pumpMaster.id = :pumpMasterId")
    BigDecimal getTotalSalaryByUserIdAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT cs FROM CalculatedSalary cs "
            + "WHERE cs.salaryConfig.id = :salaryConfigId "
            + "AND cs.pumpMaster.id = :pumpMasterId "
            + "ORDER BY cs.fromDate DESC")
    List<CalculatedSalary> findBySalaryConfigIdAndPumpMasterId(
            @Param("salaryConfigId") UUID salaryConfigId,
            @Param("pumpMasterId") UUID pumpMasterId
    );
}
