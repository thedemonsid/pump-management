package com.reallink.pump.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanShift;

@Repository
public interface SalesmanShiftRepository extends JpaRepository<SalesmanShift, UUID> {

    List<SalesmanShift> findByPumpMaster_Id(UUID pumpMasterId);

    Optional<SalesmanShift> findBySalesman_IdAndShift_IdAndShiftDateAndPumpMaster_Id(UUID salesmanId, UUID shiftId, LocalDate shiftDate, UUID pumpMasterId);

    boolean existsBySalesman_IdAndShift_IdAndShiftDateAndPumpMaster_Id(UUID salesmanId, UUID shiftId, LocalDate shiftDate, UUID pumpMasterId);

    boolean existsBySalesman_IdAndShift_IdAndShiftDateAndPumpMaster_IdAndIdNot(UUID salesmanId, UUID shiftId, LocalDate shiftDate, UUID pumpMasterId, UUID id);

    List<SalesmanShift> findBySalesman_Id(UUID salesmanId);

    List<SalesmanShift> findByShift_Id(UUID shiftId);

    List<SalesmanShift> findByShiftDate(LocalDate shiftDate);

    @Query("SELECT ss FROM SalesmanShift ss WHERE LOWER(ss.salesman.name) LIKE LOWER(CONCAT('%', :salesmanName, '%'))")
    List<SalesmanShift> findBySalesmanNameContainingIgnoreCase(@Param("salesmanName") String salesmanName);

    @Query("SELECT ss FROM SalesmanShift ss WHERE LOWER(ss.shift.name) LIKE LOWER(CONCAT('%', :shiftName, '%'))")
    List<SalesmanShift> findByShiftNameContainingIgnoreCase(@Param("shiftName") String shiftName);

    @Query("SELECT ss FROM SalesmanShift ss WHERE "
            + "(:salesmanId IS NULL OR ss.salesman.id = :salesmanId) AND "
            + "(:shiftId IS NULL OR ss.shift.id = :shiftId) AND "
            + "(:shiftDate IS NULL OR ss.shiftDate = :shiftDate) AND "
            + "(:pumpMasterId IS NULL OR ss.pumpMaster.id = :pumpMasterId)")
    Page<SalesmanShift> findBySearchCriteria(@Param("salesmanId") UUID salesmanId,
            @Param("shiftId") UUID shiftId,
            @Param("shiftDate") LocalDate shiftDate,
            @Param("pumpMasterId") UUID pumpMasterId,
            Pageable pageable);

    @Query("SELECT COUNT(ss) FROM SalesmanShift ss WHERE ss.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
