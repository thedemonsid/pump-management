package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateManagerRequest;
import com.reallink.pump.dto.request.UpdateManagerRequest;
import com.reallink.pump.dto.response.ManagerResponse;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Role;
import com.reallink.pump.entities.User;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.ManagerMapper;
import com.reallink.pump.repositories.ManagerRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.RoleRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagerService {

    private final ManagerRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final RoleRepository roleRepository;
    private final ManagerMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public List<ManagerResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ManagerResponse getById(@NotNull UUID id) {
        User user = repository.findById(id).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("MANAGER_NOT_FOUND", "Manager with ID " + id + " not found");
        }
        // Verify it's a manager
        if (!"MANAGER".equals(user.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_MANAGER", "User with ID " + id + " is not a manager");
        }
        return mapper.toResponse(user);
    }

    @Transactional
    public ManagerResponse create(@Valid CreateManagerRequest request, @NotNull UUID pumpMasterId) {
        // Check for duplicate username
        if (repository.existsByUsernameAndPumpMaster_Id(request.getUsername(), pumpMasterId)) {
            throw new PumpBusinessException("DUPLICATE_MANAGER",
                    "Manager with username '" + request.getUsername() + "' already exists for this pump master");
        }

        // Fetch the PumpInfoMaster entity
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + pumpMasterId + " does not exist");
        }

        User user = mapper.toEntity(request);
        user.setPumpMaster(pumpMaster);

        // Set role to MANAGER
        Role role = roleRepository.findByRoleName("MANAGER").orElse(null);
        if (role == null) {
            throw new PumpBusinessException("ROLE_NOT_FOUND", "MANAGER role does not exist");
        }
        user.setRole(role);

        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = repository.save(user);
        return mapper.toResponse(savedUser);
    }

    @Transactional
    public ManagerResponse update(@NotNull UUID id, @Valid UpdateManagerRequest request) {
        User existingUser = repository.findById(id).orElse(null);
        if (existingUser == null) {
            throw new PumpBusinessException("MANAGER_NOT_FOUND", "Manager with ID " + id + " not found");
        }

        // Verify it's a manager
        if (!"MANAGER".equals(existingUser.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_MANAGER", "User with ID " + id + " is not a manager");
        }

        // Check for duplicate username if username is being updated
        if (request.getUsername() != null
                && !request.getUsername().equals(existingUser.getUsername())
                && repository.existsByUsernameAndPumpMaster_Id(request.getUsername(), existingUser.getPumpMaster().getId())) {
            throw new PumpBusinessException("DUPLICATE_MANAGER",
                    "Manager with username '" + request.getUsername() + "' already exists for this pump master");
        }

        mapper.updateEntityFromRequest(request, existingUser);

        // Encode password if provided
        if (request.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = repository.save(existingUser);
        return mapper.toResponse(savedUser);
    }
}
