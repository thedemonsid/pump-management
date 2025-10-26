package com.reallink.pump.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Expense;
import com.reallink.pump.entities.Expense.ExpenseType;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByPumpMaster_Id(UUID pumpMasterId);

    List<Expense> findByExpenseHead_Id(UUID expenseHeadId);

    List<Expense> findByExpenseType(ExpenseType expenseType);

    List<Expense> findByPumpMaster_IdAndExpenseType(UUID pumpMasterId, ExpenseType expenseType);

    List<Expense> findBySalesmanNozzleShift_Id(UUID salesmanNozzleShiftId);

    List<Expense> findByBankAccount_Id(UUID bankAccountId);

    List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);

    List<Expense> findByPumpMaster_IdAndExpenseDateBetween(UUID pumpMasterId, LocalDate startDate, LocalDate endDate);

    List<Expense> findByPumpMaster_IdAndExpenseHead_IdAndExpenseDateBetween(
            UUID pumpMasterId, UUID expenseHeadId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE "
            + "(:pumpMasterId IS NULL OR e.pumpMaster.id = :pumpMasterId) AND "
            + "(:expenseHeadId IS NULL OR e.expenseHead.id = :expenseHeadId) AND "
            + "(:expenseType IS NULL OR e.expenseType = :expenseType) AND "
            + "(:salesmanNozzleShiftId IS NULL OR e.salesmanNozzleShift.id = :salesmanNozzleShiftId) AND "
            + "(:bankAccountId IS NULL OR e.bankAccount.id = :bankAccountId) AND "
            + "(:startDate IS NULL OR e.expenseDate >= :startDate) AND "
            + "(:endDate IS NULL OR e.expenseDate <= :endDate) AND "
            + "(:referenceNumber IS NULL OR LOWER(e.referenceNumber) LIKE LOWER(CONCAT('%', :referenceNumber, '%')))")
    List<Expense> findBySearchCriteria(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("expenseHeadId") UUID expenseHeadId,
            @Param("expenseType") ExpenseType expenseType,
            @Param("salesmanNozzleShiftId") UUID salesmanNozzleShiftId,
            @Param("bankAccountId") UUID bankAccountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("referenceNumber") String referenceNumber);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.pumpMaster.id = :pumpMasterId AND e.expenseType = :expenseType")
    long countByPumpMasterIdAndExpenseType(@Param("pumpMasterId") UUID pumpMasterId, @Param("expenseType") ExpenseType expenseType);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.pumpMaster.id = :pumpMasterId")
    java.math.BigDecimal sumAmountByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.pumpMaster.id = :pumpMasterId AND e.expenseDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumAmountByPumpMasterIdAndDateRange(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.salesmanNozzleShift.id = :salesmanNozzleShiftId")
    java.math.BigDecimal sumAmountBySalesmanNozzleShiftId(@Param("salesmanNozzleShiftId") UUID salesmanNozzleShiftId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.bankAccount.id = :bankAccountId AND e.expenseDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumAmountByBankAccountIdAndDateRange(
            @Param("bankAccountId") UUID bankAccountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
