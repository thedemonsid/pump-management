package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.RoleRequest;
import com.reallink.pump.dto.response.RoleResponse;
import com.reallink.pump.entities.Role;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.RoleMapper;
import com.reallink.pump.repositories.RoleRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository repository;
    private final RoleMapper mapper;

    public List<RoleResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public RoleResponse getById(@NotNull UUID id) {
        Role role = repository.findById(id).orElse(null);
        if (role == null) {
            throw new PumpBusinessException("ROLE_NOT_FOUND", "Role with ID " + id + " not found");
        }
        return mapper.toResponse(role);
    }

    public RoleResponse getByRoleName(@NotNull String roleName) {
        Role role = repository.findByRoleName(roleName).orElse(null);
        if (role == null) {
            throw new PumpBusinessException("ROLE_NOT_FOUND", "Role with name '" + roleName + "' not found");
        }
        return mapper.toResponse(role);
    }

    @Transactional
    public RoleResponse create(@Valid RoleRequest request) {
        // Check for duplicate role name
        if (repository.existsByRoleName(request.getRoleName())) {
            throw new PumpBusinessException("DUPLICATE_ROLE",
                    "Role with name '" + request.getRoleName() + "' already exists");
        }
        Role role = mapper.toEntity(request);
        Role savedRole = repository.save(role);
        return mapper.toResponse(savedRole);
    }

    @Transactional
    public RoleResponse update(@NotNull UUID id, @Valid RoleRequest request) {
        Role existingRole = repository.findById(id).orElse(null);
        if (existingRole == null) {
            throw new PumpBusinessException("ROLE_NOT_FOUND", "Role with ID " + id + " not found");
        }

        // Check for duplicate role name if name is being updated
        if (request.getRoleName() != null
                && !request.getRoleName().equals(existingRole.getRoleName())
                && repository.existsByRoleName(request.getRoleName())) {
            throw new PumpBusinessException("DUPLICATE_ROLE",
                    "Role with name '" + request.getRoleName() + "' already exists");
        }

        mapper.updateEntityFromRequest(request, existingRole);
        Role updatedRole = repository.save(existingRole);
        return mapper.toResponse(updatedRole);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("ROLE_NOT_FOUND", "Role with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public boolean existsByRoleName(@NotNull String roleName) {
        return repository.existsByRoleName(roleName);
    }
}
