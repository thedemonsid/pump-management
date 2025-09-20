package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

  Optional<Product> findByProductNameAndPumpMaster_Id(String productName, UUID pumpMasterId);

  List<Product> findByPumpMaster_Id(UUID pumpMasterId);

  boolean existsByProductNameAndPumpMaster_Id(String productName, UUID pumpMasterId);

  boolean existsByProductNameAndPumpMaster_IdAndIdNot(String productName, UUID pumpMasterId, UUID id);

  List<Product> findByProductNameContainingIgnoreCase(String productName);

  List<Product> findByHsnCode(String hsnCode);

  @Query("SELECT p FROM Product p WHERE "
      + "(:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%'))) AND "
      + "(:hsnCode IS NULL OR p.hsnCode = :hsnCode) AND "
      + "(:pumpMasterId IS NULL OR p.pumpMaster.id = :pumpMasterId)")
  List<Product> findBySearchCriteria(@Param("productName") String productName,
      @Param("hsnCode") String hsnCode,
      @Param("pumpMasterId") UUID pumpMasterId);

  @Query("SELECT p FROM Product p WHERE p.salesRate BETWEEN :minRate AND :maxRate")
  List<Product> findBySalesRateBetween(@Param("minRate") BigDecimal minRate,
      @Param("maxRate") BigDecimal maxRate);

  @Query("SELECT COUNT(p) FROM Product p WHERE p.pumpMaster.id = :pumpMasterId")
  long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

  @Query("SELECT DISTINCT p.salesUnit FROM Product p")
  List<String> findDistinctSalesUnits();

  @Query("SELECT p FROM Product p WHERE SIZE(p.tanks) = 0")
  List<Product> findProductsWithoutTanks();
}
