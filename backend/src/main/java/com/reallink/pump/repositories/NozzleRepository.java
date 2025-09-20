package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Nozzle;

@Repository
public interface NozzleRepository extends JpaRepository<Nozzle, UUID> {

    List<Nozzle> findByPumpMaster_Id(UUID pumpMasterId);

    List<Nozzle> findByTankId(UUID tankId);

    Optional<Nozzle> findByNozzleNameAndPumpMaster_Id(String nozzleName, UUID pumpMasterId);

    boolean existsByNozzleNameAndPumpMaster_Id(String nozzleName, UUID pumpMasterId);

    boolean existsByNozzleNameAndPumpMaster_IdAndIdNot(String nozzleName, UUID pumpMasterId, UUID id);

    List<Nozzle> findByStatus(String status);

    @Query("SELECT n FROM Nozzle n WHERE "
            + "(:nozzleName IS NULL OR LOWER(n.nozzleName) LIKE LOWER(CONCAT('%', :nozzleName, '%'))) AND "
            + "(:pumpMasterId IS NULL OR n.pumpMaster.id = :pumpMasterId) AND "
            + "(:tankId IS NULL OR n.tank.id = :tankId) AND "
            + "(:status IS NULL OR n.status = :status)")
    List<Nozzle> findBySearchCriteria(@Param("nozzleName") String nozzleName,
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("tankId") UUID tankId,
            @Param("status") String status);

    @Query("SELECT COUNT(n) FROM Nozzle n WHERE n.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(n) FROM Nozzle n WHERE n.tank.id = :tankId")
    long countByTankId(@Param("tankId") UUID tankId);

    List<Nozzle> findByCompanyNameContainingIgnoreCase(String companyName);

    List<Nozzle> findByNozzleNameContainingIgnoreCase(String nozzleName);
}
