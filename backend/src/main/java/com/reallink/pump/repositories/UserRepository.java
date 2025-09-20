package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsernameAndPumpMaster_Id(String username, UUID pumpMasterId);

    List<User> findByPumpMaster_Id(UUID pumpMasterId);

    boolean existsByUsernameAndPumpMaster_Id(String username, UUID pumpMasterId);

    boolean existsByUsernameAndPumpMaster_IdAndIdNot(String username, UUID pumpMasterId, UUID id);

    List<User> findByUsernameContainingIgnoreCase(String username);

    @Query("SELECT u FROM User u WHERE "
            + "(:username IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND "
            + "(:mobileNumber IS NULL OR u.mobileNumber = :mobileNumber) AND "
            + "(:role IS NULL OR LOWER(u.role) LIKE LOWER(CONCAT('%', :role, '%'))) AND "
            + "(:enabled IS NULL OR u.enabled = :enabled) AND "
            + "(:pumpMasterId IS NULL OR u.pumpMaster.id = :pumpMasterId)")
    List<User> findBySearchCriteria(@Param("username") String username,
            @Param("mobileNumber") String mobileNumber,
            @Param("role") String role,
            @Param("enabled") Boolean enabled,
            @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
