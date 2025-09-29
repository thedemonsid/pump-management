package com.reallink.pump.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.SalesmanShiftAccounting;

@Repository
public interface SalesmanShiftAccountingRepository extends JpaRepository<SalesmanShiftAccounting, UUID> {
}
