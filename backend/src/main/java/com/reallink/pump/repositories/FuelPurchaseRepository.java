package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.FuelPurchase;

@Repository
public interface FuelPurchaseRepository extends JpaRepository<FuelPurchase, UUID> {

    List<FuelPurchase> findByPumpMaster_Id(UUID pumpMasterId);

    Optional<FuelPurchase> findByFuelPurchaseIdAndPumpMaster_Id(Long fuelPurchaseId, UUID pumpMasterId);

    boolean existsByFuelPurchaseIdAndPumpMaster_Id(Long fuelPurchaseId, UUID pumpMasterId);

    boolean existsByInvoiceNumberAndPumpMaster_Id(String invoiceNumber, UUID pumpMasterId);

    boolean existsByInvoiceNumberAndPumpMaster_IdAndIdNot(String invoiceNumber, UUID pumpMasterId, UUID id);

    @Query("SELECT COALESCE(MAX(fp.fuelPurchaseId), 0) FROM FuelPurchase fp WHERE fp.pumpMaster.id = :pumpMasterId")
    Long findMaxFuelPurchaseIdByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COALESCE(SUM(fp.amount), 0) FROM FuelPurchase fp WHERE fp.pumpMaster.id = :pumpMasterId AND fp.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal findTotalFuelPurchasesInPeriod(@Param("pumpMasterId") UUID pumpMasterId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
}
