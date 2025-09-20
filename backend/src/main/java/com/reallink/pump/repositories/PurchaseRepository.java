package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
}
