package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Purchase;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {

    List<Purchase> findByPumpMaster_Id(UUID pumpMasterId);

    Optional<Purchase> findByPurchaseIdAndPumpMaster_Id(Long purchaseId, UUID pumpMasterId);

    boolean existsByPurchaseIdAndPumpMaster_Id(Long purchaseId, UUID pumpMasterId);

    boolean existsByInvoiceNumberAndPumpMaster_Id(String invoiceNumber, UUID pumpMasterId);

    boolean existsByInvoiceNumberAndPumpMaster_IdAndIdNot(String invoiceNumber, UUID pumpMasterId, UUID id);

    @Query("SELECT COALESCE(MAX(p.purchaseId), 0) FROM Purchase p WHERE p.pumpMaster.id = :pumpMasterId")
    Long findMaxPurchaseIdByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT p FROM Purchase p WHERE p.supplier.id = :supplierId ORDER BY p.purchaseDate DESC")
    List<Purchase> findTopNBySupplierIdOrderByPurchaseDateDesc(@Param("supplierId") UUID supplierId, Pageable pageable);

    /**
     * Find purchases by pump master ID and date range (optimized with indexed
     * query)
     *
     * @param pumpMasterId The pump master ID
     * @param fromDate The start date (inclusive)
     * @param toDate The end date (inclusive)
     * @return List of purchases within the date range
     */
    @Query("SELECT p FROM Purchase p "
            + "WHERE p.pumpMaster.id = :pumpMasterId "
            + "AND p.purchaseDate >= :fromDate "
            + "AND p.purchaseDate <= :toDate "
            + "ORDER BY p.purchaseDate DESC, p.id DESC")
    List<Purchase> findByPumpMasterIdAndDateRange(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("fromDate") java.time.LocalDate fromDate,
            @Param("toDate") java.time.LocalDate toDate);
}
