package com.reallink.pump.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.User;

@Repository
public interface SalesmanRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u WHERE u.role.roleName = 'SALESMAN' AND u.pumpMaster.id = :pumpMasterId")
    List<User> findByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT u FROM User u WHERE u.role.roleName = 'SALESMAN' AND u.pumpMaster.id = :pumpMasterId AND u.username = :username")
    User findByUsernameAndPumpMasterId(@Param("username") String username, @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.roleName = 'SALESMAN' AND u.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    boolean existsByUsernameAndPumpMaster_Id(String username, UUID pumpMasterId);
}
