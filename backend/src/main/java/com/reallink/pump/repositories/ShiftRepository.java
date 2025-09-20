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

import com.reallink.pump.entities.Shift;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, UUID> {

    List<Shift> findByPumpMaster_Id(UUID pumpMasterId);

    Optional<Shift> findByNameAndPumpMaster_Id(String name, UUID pumpMasterId);

    boolean existsByNameAndPumpMaster_Id(String name, UUID pumpMasterId);

    boolean existsByNameAndPumpMaster_IdAndIdNot(String name, UUID pumpMasterId, UUID id);

    List<Shift> findByNameContainingIgnoreCase(String name);

    @Query("SELECT s FROM Shift s WHERE "
            + "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND "
            + "(:pumpMasterId IS NULL OR s.pumpMaster.id = :pumpMasterId)")
    Page<Shift> findBySearchCriteria(@Param("name") String name,
            @Param("pumpMasterId") UUID pumpMasterId,
            Pageable pageable);

    @Query("SELECT COUNT(s) FROM Shift s WHERE s.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
