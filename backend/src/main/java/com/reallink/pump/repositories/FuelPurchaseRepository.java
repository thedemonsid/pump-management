package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
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

    @Query("SELECT fp FROM FuelPurchase fp WHERE fp.supplier.id = :supplierId ORDER BY fp.purchaseDate DESC")
    List<FuelPurchase> findTopNBySupplierIdOrderByPurchaseDateDesc(@Param("supplierId") UUID supplierId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(fp.amount), 0) FROM FuelPurchase fp WHERE fp.pumpMaster.id = :pumpMasterId AND fp.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal findTotalFuelPurchasesInPeriod(@Param("pumpMasterId") UUID pumpMasterId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    /**
     * Find fuel purchases by pump master ID and date range (optimized with
     * indexed query) Uses purchaseDate field which should be indexed for
     * performance
     *
     * @param pumpMasterId The pump master ID
     * @param fromDate The start date (inclusive)
     * @param toDate The end date (inclusive)
     * @return List of fuel purchases within the date range
     */
    @Query("SELECT fp FROM FuelPurchase fp "
            + "WHERE fp.pumpMaster.id = :pumpMasterId "
            + "AND fp.purchaseDate >= :fromDate "
            + "AND fp.purchaseDate <= :toDate "
            + "ORDER BY fp.purchaseDate DESC, fp.fuelPurchaseId DESC")
    List<FuelPurchase> findByPumpMasterIdAndDateRange(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("fromDate") java.time.LocalDate fromDate,
            @Param("toDate") java.time.LocalDate toDate);
}
