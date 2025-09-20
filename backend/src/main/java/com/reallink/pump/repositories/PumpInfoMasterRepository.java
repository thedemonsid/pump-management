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

import com.reallink.pump.entities.PumpInfoMaster;

@Repository
public interface PumpInfoMasterRepository extends JpaRepository<PumpInfoMaster, UUID> {

    Optional<PumpInfoMaster> findByPumpCode(String pumpCode);

    Optional<PumpInfoMaster> findByPumpId(Integer pumpId);

    boolean existsByPumpCode(String pumpCode);

    boolean existsByPumpId(Integer pumpId);

    boolean existsByPumpCodeAndIdNot(String pumpCode, UUID id);

    boolean existsByPumpIdAndIdNot(Integer pumpId, UUID id);

    List<PumpInfoMaster> findByPumpNameContainingIgnoreCase(String pumpName);

    List<PumpInfoMaster> findByPumpCodeContainingIgnoreCase(String pumpCode);

    @Query("SELECT p FROM PumpInfoMaster p WHERE "
            + "(:pumpName IS NULL OR LOWER(p.pumpName) LIKE LOWER(CONCAT('%', :pumpName, '%'))) AND "
            + "(:pumpCode IS NULL OR LOWER(p.pumpCode) LIKE LOWER(CONCAT('%', :pumpCode, '%')))")
    Page<PumpInfoMaster> findBySearchCriteria(@Param("pumpName") String pumpName,
            @Param("pumpCode") String pumpCode,
            Pageable pageable);

    @Query("SELECT COUNT(p) FROM PumpInfoMaster p")
    long countTotal();
}
