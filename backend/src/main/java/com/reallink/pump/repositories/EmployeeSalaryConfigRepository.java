package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.EmployeeSalaryConfig;

@Repository
public interface EmployeeSalaryConfigRepository extends JpaRepository<EmployeeSalaryConfig, UUID> {

    @Query("SELECT esc FROM EmployeeSalaryConfig esc "
            + "WHERE esc.pumpMaster.id = :pumpMasterId "
            + "ORDER BY esc.effectiveFrom DESC")
    List<EmployeeSalaryConfig> findByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT esc FROM EmployeeSalaryConfig esc "
            + "WHERE esc.user.id = :userId AND esc.pumpMaster.id = :pumpMasterId "
            + "ORDER BY esc.effectiveFrom DESC")
    List<EmployeeSalaryConfig> findByUserIdAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT esc FROM EmployeeSalaryConfig esc "
            + "WHERE esc.user.id = :userId "
            + "AND esc.pumpMaster.id = :pumpMasterId "
            + "AND esc.isActive = true "
            + "ORDER BY esc.effectiveFrom DESC")
    Optional<EmployeeSalaryConfig> findActiveConfigByUserIdAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT esc FROM EmployeeSalaryConfig esc "
            + "WHERE esc.pumpMaster.id = :pumpMasterId "
            + "AND esc.isActive = :isActive "
            + "ORDER BY esc.effectiveFrom DESC")
    List<EmployeeSalaryConfig> findByPumpMasterIdAndIsActive(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("isActive") Boolean isActive
    );

    boolean existsByUserIdAndPumpMasterIdAndIsActive(UUID userId, UUID pumpMasterId, Boolean isActive);
}
