package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateCalculatedSalaryRequest;
import com.reallink.pump.dto.request.UpdateCalculatedSalaryRequest;
import com.reallink.pump.dto.response.CalculatedSalaryResponse;
import com.reallink.pump.entities.CalculatedSalary;
import com.reallink.pump.entities.EmployeeSalaryConfig;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.User;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.CalculatedSalaryMapper;
import com.reallink.pump.repositories.CalculatedSalaryRepository;
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
public class CalculatedSalaryService {

    private final CalculatedSalaryRepository repository;
    private final UserRepository userRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final EmployeeSalaryConfigRepository salaryConfigRepository;
    private final CalculatedSalaryMapper mapper;

    public List<CalculatedSalaryResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CalculatedSalaryResponse> getByUserId(@NotNull UUID userId, @NotNull UUID pumpMasterId) {
        return repository.findByUserIdAndPumpMasterId(userId, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CalculatedSalaryResponse> getByDateRange(
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            @NotNull UUID pumpMasterId) {
        return repository.findByCalculationDateBetweenAndPumpMasterId(startDate, endDate, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CalculatedSalaryResponse> getBySalaryConfigId(
            @NotNull UUID salaryConfigId,
            @NotNull UUID pumpMasterId) {
        return repository.findBySalaryConfigIdAndPumpMasterId(salaryConfigId, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public BigDecimal getTotalSalaryByUserId(@NotNull UUID userId, @NotNull UUID pumpMasterId) {
        return repository.getTotalSalaryByUserIdAndPumpMasterId(userId, pumpMasterId);
    }

    public CalculatedSalaryResponse getById(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        CalculatedSalary salary = repository.findById(id).orElse(null);
        if (salary == null) {
            throw new PumpBusinessException("CALCULATED_SALARY_NOT_FOUND",
                    "Calculated salary with ID " + id + " not found");
        }

        if (!salary.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Calculated salary does not belong to the specified pump master");
        }

        return mapper.toResponse(salary);
    }

    @Transactional
    public CalculatedSalaryResponse create(@Valid CreateCalculatedSalaryRequest request) {
        // Validate date range
        if (request.getToDate().isBefore(request.getFromDate())) {
            throw new PumpBusinessException("INVALID_DATE_RANGE",
                    "To date cannot be before from date");
        }

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

        // Fetch the salary config
        EmployeeSalaryConfig salaryConfig = salaryConfigRepository.findById(request.getSalaryConfigId()).orElse(null);
        if (salaryConfig == null) {
            throw new PumpBusinessException("SALARY_CONFIG_NOT_FOUND",
                    "Salary configuration with ID " + request.getSalaryConfigId() + " does not exist");
        }

        // Verify salary config belongs to the user and pump master
        if (!salaryConfig.getUser().getId().equals(request.getUserId())
                || !salaryConfig.getPumpMaster().getId().equals(request.getPumpMasterId())) {
            throw new PumpBusinessException("INVALID_SALARY_CONFIG",
                    "Salary configuration does not belong to the specified user and pump master");
        }

        // Check for overlapping salary calculations
        List<CalculatedSalary> overlappingSalaries = repository.findByUserIdAndDateRangeAndPumpMasterId(
                request.getUserId(), request.getFromDate(), request.getPumpMasterId());
        overlappingSalaries.addAll(repository.findByUserIdAndDateRangeAndPumpMasterId(
                request.getUserId(), request.getToDate(), request.getPumpMasterId()));

        if (!overlappingSalaries.isEmpty()) {
            throw new PumpBusinessException("OVERLAPPING_SALARY_PERIOD",
                    "A salary calculation already exists for this user in the specified date range");
        }

        CalculatedSalary salary = mapper.toEntity(request);
        salary.setUser(user);
        salary.setPumpMaster(pumpMaster);
        salary.setSalaryConfig(salaryConfig);

        CalculatedSalary savedSalary = repository.save(salary);
        return mapper.toResponse(savedSalary);
    }

    @Transactional
    public CalculatedSalaryResponse update(
            @NotNull UUID id,
            @Valid UpdateCalculatedSalaryRequest request,
            @NotNull UUID pumpMasterId) {
        CalculatedSalary existingSalary = repository.findById(id).orElse(null);
        if (existingSalary == null) {
            throw new PumpBusinessException("CALCULATED_SALARY_NOT_FOUND",
                    "Calculated salary with ID " + id + " not found");
        }

        // Verify salary belongs to the pump master
        if (!existingSalary.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Calculated salary does not belong to the specified pump master");
        }

        // Validate date range
        if (request.getToDate().isBefore(request.getFromDate())) {
            throw new PumpBusinessException("INVALID_DATE_RANGE",
                    "To date cannot be before from date");
        }

        mapper.updateEntityFromRequest(request, existingSalary);

        CalculatedSalary savedSalary = repository.save(existingSalary);
        return mapper.toResponse(savedSalary);
    }

    @Transactional
    public void delete(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        CalculatedSalary salary = repository.findById(id).orElse(null);
        if (salary == null) {
            throw new PumpBusinessException("CALCULATED_SALARY_NOT_FOUND",
                    "Calculated salary with ID " + id + " not found");
        }

        // Verify salary belongs to the pump master
        if (!salary.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Calculated salary does not belong to the specified pump master");
        }

        repository.delete(salary);
    }
}
