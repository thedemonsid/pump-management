package com.reallink.pump.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.BillItem;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, UUID> {

    List<BillItem> findByBill_Id(UUID billId);

    List<BillItem> findByProduct_Id(UUID productId);

    @Query("SELECT bi FROM BillItem bi WHERE bi.bill.pumpMaster.id = :pumpMasterId")
    List<BillItem> findByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT bi FROM BillItem bi WHERE bi.product.id = :productId AND bi.bill.pumpMaster.id = :pumpMasterId")
    List<BillItem> findByProductIdAndPumpMasterId(@Param("productId") UUID productId, @Param("pumpMasterId") UUID pumpMasterId);

    void deleteByBill_Id(UUID billId);
}
