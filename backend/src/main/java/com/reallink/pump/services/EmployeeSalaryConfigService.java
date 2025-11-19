package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateEmployeeSalaryConfigRequest;
import com.reallink.pump.dto.request.UpdateEmployeeSalaryConfigRequest;
import com.reallink.pump.dto.response.EmployeeSalaryConfigResponse;
import com.reallink.pump.entities.EmployeeSalaryConfig;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.User;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.EmployeeSalaryConfigMapper;
import com.reallink.pump.repositories.EmployeeSalaryConfigRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeSalaryConfigService {

    private final EmployeeSalaryConfigRepository repository;
    private final UserRepository userRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final EmployeeSalaryConfigMapper mapper;

    public List<EmployeeSalaryConfigResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<EmployeeSalaryConfigResponse> getByUserId(@NotNull UUID userId, @NotNull UUID pumpMasterId) {
        return repository.findByUserIdAndPumpMasterId(userId, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public EmployeeSalaryConfigResponse getActiveConfigByUserId(@NotNull UUID userId, @NotNull UUID pumpMasterId) {
        return repository.findActiveConfigByUserIdAndPumpMasterId(userId, pumpMasterId)
                .map(mapper::toResponse)
                .orElse(null);
    }

    public List<EmployeeSalaryConfigResponse> getByActiveStatus(
            @NotNull Boolean isActive,
            @NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdAndIsActive(pumpMasterId, isActive).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public EmployeeSalaryConfigResponse getById(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        EmployeeSalaryConfig config = repository.findById(id).orElse(null);
        if (config == null) {
            throw new PumpBusinessException("SALARY_CONFIG_NOT_FOUND",
                    "Salary configuration with ID " + id + " not found");
        }

        if (!config.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Salary configuration does not belong to the specified pump master");
        }

        return mapper.toResponse(config);
    }

    @Transactional
    public EmployeeSalaryConfigResponse create(@Valid CreateEmployeeSalaryConfigRequest request) {
        // Fetch the user
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("USER_NOT_FOUND",
                    "User with ID " + request.getUserId() + " does not exist");
        }

        // Verify user belongs to the pump master
        if (!user.getPumpMaster().getId().equals(request.getPumpMasterId())) {
            throw new PumpBusinessException("INVALID_USER",
                    "User does not belong to the specified pump master");
        }

        // Fetch the PumpInfoMaster entity
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Check if active config already exists for this user
        if (repository.existsByUserIdAndPumpMasterIdAndIsActive(
                request.getUserId(), request.getPumpMasterId(), true)) {
            throw new PumpBusinessException("ACTIVE_CONFIG_EXISTS",
                    "An active salary configuration already exists for this user. Please deactivate it first.");
        }

        EmployeeSalaryConfig config = mapper.toEntity(request);
        config.setUser(user);
        config.setPumpMaster(pumpMaster);
        config.setIsActive(true);

        EmployeeSalaryConfig savedConfig = repository.save(config);
        return mapper.toResponse(savedConfig);
    }

    @Transactional
    public EmployeeSalaryConfigResponse update(
            @NotNull UUID id,
            @Valid UpdateEmployeeSalaryConfigRequest request,
            @NotNull UUID pumpMasterId) {
        EmployeeSalaryConfig existingConfig = repository.findById(id).orElse(null);
        if (existingConfig == null) {
            throw new PumpBusinessException("SALARY_CONFIG_NOT_FOUND",
                    "Salary configuration with ID " + id + " not found");
        }

        // Verify config belongs to the pump master
        if (!existingConfig.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Salary configuration does not belong to the specified pump master");
        }

        // If activating this config, check if another active config exists for the same user
        if (request.getIsActive() != null && request.getIsActive() && !existingConfig.getIsActive()) {
            if (repository.existsByUserIdAndPumpMasterIdAndIsActive(
                    existingConfig.getUser().getId(), pumpMasterId, true)) {
                throw new PumpBusinessException("ACTIVE_CONFIG_EXISTS",
                        "An active salary configuration already exists for this user. Please deactivate it first.");
            }
        }

        mapper.updateEntityFromRequest(request, existingConfig);

        EmployeeSalaryConfig savedConfig = repository.save(existingConfig);
        return mapper.toResponse(savedConfig);
    }

    @Transactional
    public void delete(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        EmployeeSalaryConfig config = repository.findById(id).orElse(null);
        if (config == null) {
            throw new PumpBusinessException("SALARY_CONFIG_NOT_FOUND",
                    "Salary configuration with ID " + id + " not found");
        }

        // Verify config belongs to the pump master
        if (!config.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Salary configuration does not belong to the specified pump master");
        }

        repository.delete(config);
    }

    @Transactional
    public void deactivateConfig(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        EmployeeSalaryConfig config = repository.findById(id).orElse(null);
        if (config == null) {
            throw new PumpBusinessException("SALARY_CONFIG_NOT_FOUND",
                    "Salary configuration with ID " + id + " not found");
        }

        // Verify config belongs to the pump master
        if (!config.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Salary configuration does not belong to the specified pump master");
        }

        config.setIsActive(false);
        repository.save(config);
    }
}
