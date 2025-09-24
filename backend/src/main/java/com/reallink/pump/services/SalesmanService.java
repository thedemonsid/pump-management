package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSalesmanRequest;
import com.reallink.pump.dto.request.UpdateSalesmanRequest;
import com.reallink.pump.dto.response.SalesmanResponse;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Role;
import com.reallink.pump.entities.User;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.RoleRepository;
import com.reallink.pump.repositories.SalesmanRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanService {

    private final SalesmanRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final RoleRepository roleRepository;
    private final SalesmanMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public List<SalesmanResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public SalesmanResponse getById(@NotNull UUID id) {
        User user = repository.findById(id).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman with ID " + id + " not found");
        }
        // Verify it's a salesman
        if (!"SALESMAN".equals(user.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_SALESMAN", "User with ID " + id + " is not a salesman");
        }
        return mapper.toResponse(user);
    }

    @Transactional
    public SalesmanResponse create(@Valid CreateSalesmanRequest request, @NotNull UUID pumpMasterId) {
        // Check for duplicate username
        if (repository.existsByUsernameAndPumpMaster_Id(request.getUsername(), pumpMasterId)) {
            throw new PumpBusinessException("DUPLICATE_SALESMAN",
                    "Salesman with username '" + request.getUsername() + "' already exists for this pump master");
        }

        // Fetch the PumpInfoMaster entity
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + pumpMasterId + " does not exist");
        }

        User user = mapper.toEntity(request);
        user.setPumpMaster(pumpMaster);

        // Set role to SALESMAN
        Role role = roleRepository.findByRoleName("SALESMAN").orElse(null);
        if (role == null) {
            throw new PumpBusinessException("ROLE_NOT_FOUND", "SALESMAN role does not exist");
        }
        user.setRole(role);

        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = repository.save(user);
        return mapper.toResponse(savedUser);
    }

    @Transactional
    public SalesmanResponse update(@NotNull UUID id, @Valid UpdateSalesmanRequest request) {
        User existingUser = repository.findById(id).orElse(null);
        if (existingUser == null) {
            throw new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman with ID " + id + " not found");
        }

        // Verify it's a salesman
        if (!"SALESMAN".equals(existingUser.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_SALESMAN", "User with ID " + id + " is not a salesman");
        }

        // Check for duplicate username if username is being updated
        if (request.getUsername() != null
                && !request.getUsername().equals(existingUser.getUsername())
                && repository.existsByUsernameAndPumpMaster_Id(request.getUsername(), existingUser.getPumpMaster().getId())) {
            throw new PumpBusinessException("DUPLICATE_SALESMAN",
                    "Salesman with username '" + request.getUsername() + "' already exists for this pump master");
        }

        mapper.updateEntityFromRequest(request, existingUser);

        // Encode password if provided
        if (request.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = repository.save(existingUser);
        return mapper.toResponse(savedUser);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        User user = repository.findById(id).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman with ID " + id + " not found");
        }

        // Verify it's a salesman
        if (!"SALESMAN".equals(user.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_SALESMAN", "User with ID " + id + " is not a salesman");
        }

        repository.delete(user);
    }
}
