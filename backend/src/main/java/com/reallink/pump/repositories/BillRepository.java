package com.reallink.pump.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Bill;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    Optional<Bill> findByBillNoAndPumpMaster_Id(Long billNo, UUID pumpMasterId);

    List<Bill> findByPumpMaster_Id(UUID pumpMasterId);

    List<Bill> findByCustomer_Id(UUID customerId);

    List<Bill> findByBillDateBetween(LocalDate startDate, LocalDate endDate);

    boolean existsByBillNoAndPumpMaster_Id(Long billNo, UUID pumpMasterId);

    boolean existsByBillNoAndPumpMaster_IdAndIdNot(Long billNo, UUID pumpMasterId, UUID id);

    @Query("SELECT b FROM Bill b WHERE b.pumpMaster.id = :pumpMasterId ORDER BY b.billDate DESC, b.createdAt DESC")
    List<Bill> findByPumpMasterIdOrderByBillDateDesc(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT b FROM Bill b WHERE b.pumpMaster.id = :pumpMasterId AND b.billDate BETWEEN :startDate AND :endDate ORDER BY b.billDate DESC, b.createdAt DESC")
    List<Bill> findByPumpMasterIdAndBillDateBetweenOrderByBillDateDesc(@Param("pumpMasterId") UUID pumpMasterId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COALESCE(MAX(b.billNo), 0) FROM Bill b WHERE b.pumpMaster.id = :pumpMasterId")
    Long findMaxBillNoByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
