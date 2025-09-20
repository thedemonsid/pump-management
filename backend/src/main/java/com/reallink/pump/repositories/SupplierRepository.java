package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    Optional<Supplier> findBySupplierNameAndPumpMaster_Id(String supplierName, UUID pumpMasterId);

    List<Supplier> findByPumpMaster_Id(UUID pumpMasterId);

    boolean existsBySupplierNameAndPumpMaster_Id(String supplierName, UUID pumpMasterId);

    boolean existsBySupplierNameAndPumpMaster_IdAndIdNot(String supplierName, UUID pumpMasterId, UUID id);

    List<Supplier> findBySupplierNameContainingIgnoreCase(String supplierName);

    List<Supplier> findByContactPersonNameContainingIgnoreCase(String contactPersonName);


    @Query("SELECT s FROM Supplier s WHERE "
            + "(:supplierName IS NULL OR LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :supplierName, '%'))) AND "
            + "(:contactPersonName IS NULL OR LOWER(s.contactPersonName) LIKE LOWER(CONCAT('%', :contactPersonName, '%'))) AND "
            + "(:address IS NULL OR LOWER(s.address) LIKE LOWER(CONCAT('%', :address, '%'))) AND "
            + "(:gstNumber IS NULL OR s.gstNumber = :gstNumber) AND "
            + "(:taxIdentificationNumber IS NULL OR s.taxIdentificationNumber = :taxIdentificationNumber) AND "
            + "(:pumpMasterId IS NULL OR s.pumpMaster.id = :pumpMasterId)")
            
    List<Supplier> findBySearchCriteria(@Param("supplierName") String supplierName,
            @Param("contactPersonName") String contactPersonName,
            @Param("address") String address,
            @Param("gstNumber") String gstNumber,
            @Param("taxIdentificationNumber") String taxIdentificationNumber,
            @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT DISTINCT s.contactPersonName FROM Supplier s")
    List<String> findDistinctContactPersonNames();
}
