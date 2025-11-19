package com.reallink.pump.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateEmployeeSalaryConfigRequest;
import com.reallink.pump.dto.request.UpdateEmployeeSalaryConfigRequest;
import com.reallink.pump.dto.response.EmployeeSalaryConfigResponse;
import com.reallink.pump.services.EmployeeSalaryConfigService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/employee-salary-configs")
@RequiredArgsConstructor
@Tag(name = "Employee Salary Configuration", description = "APIs for managing employee salary configurations")
public class EmployeeSalaryConfigController {

    private final EmployeeSalaryConfigService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
            throw new RuntimeException("Pump master ID not found in request");
        }
        return (UUID) pumpMasterIdObj;
    }

    @GetMapping
    @Operation(summary = "Get all salary configurations", description = "Retrieve all salary configurations for the authenticated pump master")
    public ResponseEntity<List<EmployeeSalaryConfigResponse>> getAllConfigs(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getAllByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get salary configuration by ID")
    public ResponseEntity<EmployeeSalaryConfigResponse> getConfigById(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getById(id, pumpMasterId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get salary configurations by user ID")
    public ResponseEntity<List<EmployeeSalaryConfigResponse>> getConfigsByUserId(
            @PathVariable UUID userId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByUserId(userId, pumpMasterId));
    }

    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Get active salary configuration for user")
    public ResponseEntity<EmployeeSalaryConfigResponse> getActiveConfigByUserId(
            @PathVariable UUID userId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getActiveConfigByUserId(userId, pumpMasterId));
    }

    @GetMapping("/status")
    @Operation(summary = "Get salary configurations by active status")
    public ResponseEntity<List<EmployeeSalaryConfigResponse>> getConfigsByStatus(
            @RequestParam Boolean isActive,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByActiveStatus(isActive, pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create salary configuration")
    public ResponseEntity<EmployeeSalaryConfigResponse> createConfig(
            @Valid @RequestBody CreateEmployeeSalaryConfigRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update salary configuration")
    public ResponseEntity<EmployeeSalaryConfigResponse> updateConfig(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmployeeSalaryConfigRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.ok(service.update(id, request, pumpMasterId));
    }

    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate salary configuration")
    public ResponseEntity<Void> deactivateConfig(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        service.deactivateConfig(id, pumpMasterId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete salary configuration")
    public ResponseEntity<Void> deleteConfig(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        service.delete(id, pumpMasterId);
        return ResponseEntity.noContent().build();
    }
}
