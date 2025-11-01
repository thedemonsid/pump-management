package com.reallink.pump.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.PurchaseItem;

@Repository
public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, UUID> {

    List<PurchaseItem> findByPurchase_Id(UUID purchaseId);

    List<PurchaseItem> findByProduct_Id(UUID productId);

    @Query("SELECT pi FROM PurchaseItem pi WHERE pi.purchase.pumpMaster.id = :pumpMasterId")
    List<PurchaseItem> findByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT pi FROM PurchaseItem pi WHERE pi.product.id = :productId AND pi.purchase.pumpMaster.id = :pumpMasterId")
    List<PurchaseItem> findByProductIdAndPumpMasterId(@Param("productId") UUID productId, @Param("pumpMasterId") UUID pumpMasterId);

    void deleteByPurchase_Id(UUID purchaseId);
}
