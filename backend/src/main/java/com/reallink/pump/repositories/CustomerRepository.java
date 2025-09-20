package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByCustomerNameAndPumpMaster_Id(String customerName, UUID pumpMasterId);

    List<Customer> findByPumpMaster_Id(UUID pumpMasterId);

    boolean existsByCustomerNameAndPumpMaster_Id(String customerName, UUID pumpMasterId);

    boolean existsByCustomerNameAndPumpMaster_IdAndIdNot(String customerName, UUID pumpMasterId, UUID id);

    List<Customer> findByCustomerNameContainingIgnoreCase(String customerName);

    @Query("SELECT c FROM Customer c WHERE "
            + "(:customerName IS NULL OR LOWER(c.customerName) LIKE LOWER(CONCAT('%', :customerName, '%'))) AND "
            + "(:address IS NULL OR LOWER(c.address) LIKE LOWER(CONCAT('%', :address, '%'))) AND "
            + "(:phoneNumber IS NULL OR c.phoneNumber = :phoneNumber) AND "
            + "(:gstNumber IS NULL OR c.gstNumber = :gstNumber) AND "
            + "(:panNumber IS NULL OR c.panNumber = :panNumber) AND "
            + "(:pumpMasterId IS NULL OR c.pumpMaster.id = :pumpMasterId)")
    List<Customer> findBySearchCriteria(@Param("customerName") String customerName,
            @Param("address") String address,
            @Param("phoneNumber") String phoneNumber,
            @Param("gstNumber") String gstNumber,
            @Param("panNumber") String panNumber,
            @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
