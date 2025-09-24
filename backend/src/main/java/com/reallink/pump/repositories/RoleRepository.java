package com.reallink.pump.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, java.util.UUID> {

    Optional<Role> findByRoleName(String roleName);

    boolean existsByRoleName(String roleName);
}
