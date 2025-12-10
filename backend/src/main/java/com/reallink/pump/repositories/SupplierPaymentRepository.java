package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SupplierPayment;

@Repository
public interface SupplierPaymentRepository extends JpaRepository<SupplierPayment, UUID> {

    List<SupplierPayment> findByPumpMasterIdOrderByPaymentDateDesc(UUID pumpMasterId);

    List<SupplierPayment> findByPumpMaster_Id(UUID pumpMasterId);

    @Query("SELECT sp FROM SupplierPayment sp WHERE sp.supplier.id = :supplierId ORDER BY sp.paymentDate DESC")
    List<SupplierPayment> findTopNBySupplierIdOrderByPaymentDateDesc(@Param("supplierId") UUID supplierId, Pageable pageable);

    List<SupplierPayment> findByPurchase_Id(UUID purchaseId);

    List<SupplierPayment> findByFuelPurchase_Id(UUID fuelPurchaseId);

    @Query("SELECT sp FROM SupplierPayment sp WHERE sp.pumpMaster.id = :pumpMasterId AND sp.purchase IS NULL AND sp.fuelPurchase IS NULL")
    List<SupplierPayment> findGeneralPaymentsByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COALESCE(SUM(sp.amount), 0) FROM SupplierPayment sp WHERE sp.purchase.id = :purchaseId")
    BigDecimal getTotalPaidAmountByPurchaseId(@Param("purchaseId") UUID purchaseId);

    @Query("SELECT COALESCE(SUM(sp.amount), 0) FROM SupplierPayment sp WHERE sp.fuelPurchase.id = :fuelPurchaseId")
    BigDecimal getTotalPaidAmountByFuelPurchaseId(@Param("fuelPurchaseId") UUID fuelPurchaseId);

    @Query("SELECT COALESCE(SUM(sp.amount), 0) FROM SupplierPayment sp WHERE sp.pumpMaster.id = :pumpMasterId AND sp.paymentDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal findTotalPaymentsInPeriod(@Param("pumpMasterId") UUID pumpMasterId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
}
