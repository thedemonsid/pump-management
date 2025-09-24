package com.reallink.pump.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.reallink.pump.entities.Role;
import com.reallink.pump.repositories.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final RoleRepository roleRepository;

    @Bean
    public CommandLineRunner initializeDefaultRoles() {
        return args -> {
            log.info("Initializing default roles...");

            // Define default roles
            String[][] defaultRoles = {
                {"ADMIN", "Administrator with full access"},
                {"MANAGER", "Manager with intermediate access"},
                {"SALESMAN", "Salesman with sales permissions"},
                {"MODERATOR", "Moderator with limited access"}
            };

            for (String[] roleData : defaultRoles) {
                String roleName = roleData[0];
                String description = roleData[1];

                if (!roleRepository.existsByRoleName(roleName)) {
                    Role role = new Role(roleName, description);
                    roleRepository.save(role);
                    log.info("Created default role: {}", roleName);
                } else {
                    log.info("Default role already exists: {}", roleName);
                }
            }

            log.info("Default roles initialization completed.");
        };
    }
}
