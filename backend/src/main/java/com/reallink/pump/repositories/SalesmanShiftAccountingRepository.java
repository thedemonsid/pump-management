package com.reallink.pump.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanShiftAccounting;

@Repository
public interface SalesmanShiftAccountingRepository extends JpaRepository<SalesmanShiftAccounting, UUID> {

    /**
     * Find accounting record for a specific salesman shift.
     */
    Optional<SalesmanShiftAccounting> findBySalesmanShiftId(UUID shiftId);

    /**
     * Check if accounting exists for a shift.
     */
    boolean existsBySalesmanShiftId(UUID shiftId);
}
