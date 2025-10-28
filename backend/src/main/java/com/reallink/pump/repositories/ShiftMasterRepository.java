package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.ShiftMaster;

/**
 * Repository for ShiftMaster (shift templates/configurations). For actual
 * salesman work shifts, see SalesmanShiftRepository.
 */
@Repository
public interface ShiftMasterRepository extends JpaRepository<ShiftMaster, UUID> {

    List<ShiftMaster> findByPumpMaster_Id(UUID pumpMasterId);

    Optional<ShiftMaster> findByNameAndPumpMaster_Id(String name, UUID pumpMasterId);

    boolean existsByNameAndPumpMaster_Id(String name, UUID pumpMasterId);

    boolean existsByNameAndPumpMaster_IdAndIdNot(String name, UUID pumpMasterId, UUID id);

    List<ShiftMaster> findByNameContainingIgnoreCase(String name);

    @Query("SELECT s FROM ShiftMaster s WHERE "
            + "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND "
            + "(:pumpMasterId IS NULL OR s.pumpMaster.id = :pumpMasterId)")
    Page<ShiftMaster> findBySearchCriteria(@Param("name") String name,
            @Param("pumpMasterId") UUID pumpMasterId,
            Pageable pageable);

    @Query("SELECT COUNT(s) FROM ShiftMaster s WHERE s.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
