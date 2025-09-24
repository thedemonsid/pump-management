package com.reallink.pump.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanBill;

@Repository
public interface SalesmanBillRepository extends JpaRepository<SalesmanBill, UUID> {

    Optional<SalesmanBill> findByBillNoAndPumpMaster_Id(Long billNo, UUID pumpMasterId);

    List<SalesmanBill> findByPumpMaster_Id(UUID pumpMasterId);

    List<SalesmanBill> findByCustomer_Id(UUID customerId);

    List<SalesmanBill> findBySalesman_Id(UUID salesmanId);

    List<SalesmanBill> findByBillDateBetween(LocalDate startDate, LocalDate endDate);

    boolean existsByBillNoAndPumpMaster_Id(Long billNo, UUID pumpMasterId);

    boolean existsByBillNoAndPumpMaster_IdAndIdNot(Long billNo, UUID pumpMasterId, UUID id);

    @Query("SELECT b FROM SalesmanBill b WHERE b.pumpMaster.id = :pumpMasterId ORDER BY b.billDate DESC, b.createdAt DESC")
    List<SalesmanBill> findByPumpMasterIdOrderByBillDateDesc(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT b FROM SalesmanBill b WHERE b.pumpMaster.id = :pumpMasterId AND b.billDate BETWEEN :startDate AND :endDate ORDER BY b.billDate DESC, b.createdAt DESC")
    List<SalesmanBill> findByPumpMasterIdAndBillDateBetweenOrderByBillDateDesc(@Param("pumpMasterId") UUID pumpMasterId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM SalesmanBill b WHERE b.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COALESCE(MAX(b.billNo), 0) FROM SalesmanBill b WHERE b.pumpMaster.id = :pumpMasterId")
    Long findMaxBillNoByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT b FROM SalesmanBill b WHERE b.salesman.id = :salesmanId AND b.billDate BETWEEN :startDate AND :endDate ORDER BY b.billDate DESC, b.createdAt DESC")
    List<SalesmanBill> findBySalesmanIdAndBillDateBetweenOrderByBillDateDesc(@Param("salesmanId") UUID salesmanId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
