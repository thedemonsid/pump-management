package com.reallink.pump.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.ProductSalesUnitChangeLog;
import com.reallink.pump.entities.ProductType;

@Repository
public interface ProductSalesUnitChangeLogRepository extends JpaRepository<ProductSalesUnitChangeLog, UUID> {

    /**
     * Find all change logs for a specific pump master
     */
    List<ProductSalesUnitChangeLog> findByPumpMaster_IdOrderByCreatedAtDesc(UUID pumpMasterId);

    /**
     * Find all change logs for a specific product
     */
    List<ProductSalesUnitChangeLog> findByProduct_IdOrderByCreatedAtDesc(UUID productId);

    /**
     * Find all change logs for a specific product type in a pump master
     */
    List<ProductSalesUnitChangeLog> findByPumpMaster_IdAndProductTypeOrderByCreatedAtDesc(UUID pumpMasterId, ProductType productType);

    /**
     * Find change logs for a pump master within a date range
     */
    @Query("SELECT p FROM ProductSalesUnitChangeLog p WHERE p.pumpMaster.id = :pumpMasterId AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<ProductSalesUnitChangeLog> findByPumpMasterIdAndDateRange(@Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Find change logs for a specific product within a date range
     */
    @Query("SELECT p FROM ProductSalesUnitChangeLog p WHERE p.product.id = :productId AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<ProductSalesUnitChangeLog> findByProductIdAndDateRange(@Param("productId") UUID productId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Find all fuel product change logs within a date range for a pump master
     */
    @Query("SELECT p FROM ProductSalesUnitChangeLog p WHERE p.pumpMaster.id = :pumpMasterId AND p.productType = 'FUEL' AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<ProductSalesUnitChangeLog> findFuelProductChangesByPumpMasterIdAndDateRange(@Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Count change logs for a specific product
     */
    long countByProduct_Id(UUID productId);

    /**
     * Count change logs for a specific pump master
     */
    long countByPumpMaster_Id(UUID pumpMasterId);

    /**
     * Find the most recent change log for a product
     */
    @Query("SELECT p FROM ProductSalesUnitChangeLog p WHERE p.product.id = :productId ORDER BY p.createdAt DESC LIMIT 1")
    ProductSalesUnitChangeLog findMostRecentChangeByProductId(@Param("productId") UUID productId);

    /**
     * Check if a product has any change logs
     */
    boolean existsByProduct_Id(UUID productId);
}
