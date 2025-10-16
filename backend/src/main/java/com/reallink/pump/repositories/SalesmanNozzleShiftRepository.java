package com.reallink.pump.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanNozzleShift;

@Repository
public interface SalesmanNozzleShiftRepository extends JpaRepository<SalesmanNozzleShift, UUID> {

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.nozzle.id = :nozzleId AND s.pumpMaster.id = :pumpMasterId ORDER BY s.endDateTime DESC")
    List<SalesmanNozzleShift> findByNozzleIdAndPumpMasterIdOrderByEndDateTimeDesc(@Param("nozzleId") UUID nozzleId, @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.salesman.id = :salesmanId AND s.pumpMaster.id = :pumpMasterId ORDER BY s.startDateTime DESC")
    List<SalesmanNozzleShift> findBySalesmanIdAndPumpMasterIdOrderByStartDateTimeDesc(@Param("salesmanId") UUID salesmanId, @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.pumpMaster.id = :pumpMasterId ORDER BY s.startDateTime DESC")
    List<SalesmanNozzleShift> findByPumpMasterIdOrderByStartDateTimeDesc(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.pumpMaster.id = :pumpMasterId AND s.startDateTime >= :fromDate AND s.startDateTime <= :toDate ORDER BY s.startDateTime DESC")
    List<SalesmanNozzleShift> findByPumpMasterIdAndStartDateTimeBetweenOrderByStartDateTimeDesc(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.salesman.id = :salesmanId AND s.pumpMaster.id = :pumpMasterId AND s.startDateTime >= :fromDate AND s.startDateTime <= :toDate ORDER BY s.startDateTime DESC")
    List<SalesmanNozzleShift> findBySalesmanIdAndPumpMasterIdAndStartDateTimeBetweenOrderByStartDateTimeDesc(
            @Param("salesmanId") UUID salesmanId,
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.salesman.id = :salesmanId AND s.pumpMaster.id = :pumpMasterId AND s.status = 'OPEN' ORDER BY s.startDateTime DESC")
    List<SalesmanNozzleShift> findOpenShiftsBySalesmanIdAndPumpMasterId(@Param("salesmanId") UUID salesmanId, @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.pumpMaster.id = :pumpMasterId AND s.status = 'OPEN' ORDER BY s.startDateTime DESC")
    List<SalesmanNozzleShift> findAllOpenShiftsByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT s FROM SalesmanNozzleShift s LEFT JOIN FETCH s.nozzle n LEFT JOIN FETCH n.tank t LEFT JOIN FETCH t.product WHERE s.id = :id")
    Optional<SalesmanNozzleShift> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT COALESCE(SUM(s.closingBalance - s.openingBalance), 0) FROM SalesmanNozzleShift s WHERE s.pumpMaster.id = :pumpMasterId AND s.createdAt BETWEEN :startDate AND :endDate AND s.closingBalance IS NOT NULL")
    java.math.BigDecimal findTotalFuelDispensedInPeriod(@Param("pumpMasterId") UUID pumpMasterId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
