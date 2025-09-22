package com.reallink.pump.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.NozzleReading;

@Repository
public interface NozzleReadingRepository extends JpaRepository<NozzleReading, UUID> {

    List<NozzleReading> findByPumpMaster_Id(UUID pumpMasterId);

    List<NozzleReading> findByPumpMaster_PumpCode(String pumpCode);

    List<NozzleReading> findByNozzle_Id(UUID nozzleId);

    List<NozzleReading> findByStatus(String status);

    List<NozzleReading> findByStatusContainingIgnoreCase(String status);

    @Query("SELECT nr FROM NozzleReading nr WHERE LOWER(nr.nozzle.nozzleName) LIKE LOWER(CONCAT('%', :nozzleName, '%'))")
    List<NozzleReading> findByNozzleNameContainingIgnoreCase(@Param("nozzleName") String nozzleName);

    @Query("SELECT COUNT(nr) FROM NozzleReading nr WHERE nr.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT nr FROM NozzleReading nr WHERE DATE(nr.readingTime) = :date AND nr.pumpMaster.id = :pumpMasterId")
    List<NozzleReading> findByDateAndPumpMasterId(@Param("date") java.time.LocalDate date, @Param("pumpMasterId") UUID pumpMasterId);
}
