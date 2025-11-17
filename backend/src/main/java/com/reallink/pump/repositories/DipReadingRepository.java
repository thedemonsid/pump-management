package com.reallink.pump.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.DipReading;

@Repository
public interface DipReadingRepository extends JpaRepository<DipReading, UUID> {

    /**
     * Find all dip readings for a specific tank
     */
    List<DipReading> findByTankIdOrderByReadingTimestampDesc(UUID tankId);

    /**
     * Find all dip readings for a specific pump master
     */
    List<DipReading> findByPumpMasterIdOrderByReadingTimestampDesc(UUID pumpMasterId);

    /**
     * Find dip readings for a tank within a date range
     */
    @Query("SELECT dr FROM DipReading dr WHERE dr.tank.id = :tankId "
            + "AND dr.readingTimestamp BETWEEN :startDate AND :endDate "
            + "ORDER BY dr.readingTimestamp DESC")
    List<DipReading> findByTankIdAndDateRange(
            @Param("tankId") UUID tankId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find dip readings for a pump master within a date range
     */
    @Query("SELECT dr FROM DipReading dr WHERE dr.pumpMaster.id = :pumpMasterId "
            + "AND dr.readingTimestamp BETWEEN :startDate AND :endDate "
            + "ORDER BY dr.readingTimestamp DESC")
    List<DipReading> findByPumpMasterIdAndDateRange(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find the latest dip reading for a specific tank
     */
    Optional<DipReading> findFirstByTankIdOrderByReadingTimestampDesc(UUID tankId);

    /**
     * Find dip readings with variance above a threshold
     */
    @Query("SELECT dr FROM DipReading dr WHERE ABS(dr.variance) > :threshold "
            + "ORDER BY dr.readingTimestamp DESC")
    List<DipReading> findReadingsWithHighVariance(@Param("threshold") Double threshold);

    /**
     * Paginated query for all dip readings
     */
    Page<DipReading> findAllByOrderByReadingTimestampDesc(Pageable pageable);

    /**
     * Paginated query for dip readings by tank
     */
    Page<DipReading> findByTankIdOrderByReadingTimestampDesc(UUID tankId, Pageable pageable);

    /**
     * Paginated query for dip readings by pump master
     */
    Page<DipReading> findByPumpMasterIdOrderByReadingTimestampDesc(UUID pumpMasterId, Pageable pageable);

    /**
     * Check if a dip reading exists for a tank at a specific timestamp
     */
    boolean existsByTankIdAndReadingTimestamp(UUID tankId, LocalDateTime readingTimestamp);

    /**
     * Count dip readings for a tank
     */
    long countByTankId(UUID tankId);

    /**
     * Advanced search with filters
     */
    @Query("SELECT dr FROM DipReading dr WHERE "
            + "(:tankId IS NULL OR dr.tank.id = :tankId) AND "
            + "(:pumpMasterId IS NULL OR dr.pumpMaster.id = :pumpMasterId) AND "
            + "(:startDate IS NULL OR dr.readingTimestamp >= :startDate) AND "
            + "(:endDate IS NULL OR dr.readingTimestamp <= :endDate) "
            + "ORDER BY dr.readingTimestamp DESC")
    Page<DipReading> searchDipReadings(
            @Param("tankId") UUID tankId,
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}
