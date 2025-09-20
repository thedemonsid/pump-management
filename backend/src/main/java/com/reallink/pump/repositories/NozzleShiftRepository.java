package com.reallink.pump.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.NozzleShift;

@Repository
public interface NozzleShiftRepository extends JpaRepository<NozzleShift, UUID> {

    List<NozzleShift> findByNozzle_Id(UUID nozzleId);

    List<NozzleShift> findBySalesman_Id(UUID salesmanId);

    List<NozzleShift> findByShiftDate(LocalDate shiftDate);

    List<NozzleShift> findByNozzle_IdAndShiftDate(UUID nozzleId, LocalDate shiftDate);

    Optional<NozzleShift> findByNozzle_IdAndShiftDateAndClosingTimeIsNull(UUID nozzleId, LocalDate shiftDate);

    List<NozzleShift> findByClosingTimeIsNull();

    @Query("SELECT ns FROM NozzleShift ns WHERE ns.nozzle.id = :nozzleId AND ns.shiftDate BETWEEN :startDate AND :endDate ORDER BY ns.shiftDate DESC, ns.openingTime DESC")
    List<NozzleShift> findByNozzleIdAndDateRange(@Param("nozzleId") UUID nozzleId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    boolean existsByNozzle_IdAndShiftDateAndClosingTimeIsNull(UUID nozzleId, LocalDate shiftDate);
}
