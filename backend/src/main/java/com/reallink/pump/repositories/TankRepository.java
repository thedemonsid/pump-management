package com.reallink.pump.repositories;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Tank;

@Repository
public interface TankRepository extends JpaRepository<Tank, UUID> {

  @Query("SELECT t FROM Tank t JOIN FETCH t.product")
  List<Tank> findAllWithProducts();

  List<Tank> findByPumpMaster_Id(UUID pumpMasterId);

  Optional<Tank> findByTankNameAndPumpMaster_Id(String tankName, UUID pumpMasterId);

  boolean existsByTankNameAndPumpMaster_Id(String tankName, UUID pumpMasterId);

  boolean existsByTankNameAndPumpMaster_IdAndIdNot(String tankName, UUID pumpMasterId, UUID id);

  List<Tank> findByProductId(UUID productId);

  List<Tank> findByTankNameContainingIgnoreCase(String tankName);

  @Query("SELECT t FROM Tank t WHERE t.currentLevel <= t.lowLevelAlert AND t.lowLevelAlert IS NOT NULL")
  List<Tank> findLowLevelTanks();

  @Query("SELECT t FROM Tank t WHERE "
      + "(:tankName IS NULL OR LOWER(t.tankName) LIKE LOWER(CONCAT('%', :tankName, '%'))) AND "
      + "(:pumpMasterId IS NULL OR t.pumpMaster.id = :pumpMasterId) AND "
      + "(:productId IS NULL OR t.product.id = :productId)")
  List<Tank> findBySearchCriteria(@Param("tankName") String tankName,
      @Param("pumpMasterId") UUID pumpMasterId,
      @Param("productId") UUID productId);

  @Query("SELECT t FROM Tank t WHERE t.capacity BETWEEN :minCapacity AND :maxCapacity")
  List<Tank> findByCapacityBetween(@Param("minCapacity") BigDecimal minCapacity,
      @Param("maxCapacity") BigDecimal maxCapacity);

  @Query("SELECT COUNT(t) FROM Tank t WHERE t.pumpMaster.id = :pumpMasterId")
  long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

  @Query("SELECT SUM(t.capacity) FROM Tank t WHERE t.pumpMaster.id = :pumpMasterId")
  BigDecimal getTotalCapacityByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

  @Query("SELECT SUM(t.currentLevel) FROM Tank t WHERE t.pumpMaster.id = :pumpMasterId")
  BigDecimal getTotalCurrentLevelByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

  @Query("SELECT t FROM Tank t WHERE SIZE(t.nozzles) = 0")
  List<Tank> findTanksWithoutNozzles();
}
