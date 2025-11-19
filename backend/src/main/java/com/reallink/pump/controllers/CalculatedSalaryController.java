package com.reallink.pump.controllers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
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

import com.reallink.pump.dto.request.CreateCalculatedSalaryRequest;
import com.reallink.pump.dto.request.UpdateCalculatedSalaryRequest;
import com.reallink.pump.dto.response.CalculatedSalaryResponse;
import com.reallink.pump.services.CalculatedSalaryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/calculated-salaries")
@RequiredArgsConstructor
@Tag(name = "Calculated Salary", description = "APIs for managing calculated salaries")
public class CalculatedSalaryController {

    private final CalculatedSalaryService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
            throw new RuntimeException("Pump master ID not found in request");
        }
        return (UUID) pumpMasterIdObj;
    }

    @GetMapping
    @Operation(summary = "Get all calculated salaries", description = "Retrieve all calculated salaries for the authenticated pump master")
    public ResponseEntity<List<CalculatedSalaryResponse>> getAllSalaries(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getAllByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get calculated salary by ID")
    public ResponseEntity<CalculatedSalaryResponse> getSalaryById(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getById(id, pumpMasterId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get calculated salaries by user ID")
    public ResponseEntity<List<CalculatedSalaryResponse>> getSalariesByUserId(
            @PathVariable UUID userId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByUserId(userId, pumpMasterId));
    }

    @GetMapping("/user/{userId}/total")
    @Operation(summary = "Get total salary amount for user")
    public ResponseEntity<BigDecimal> getTotalSalaryByUserId(
            @PathVariable UUID userId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getTotalSalaryByUserId(userId, pumpMasterId));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get calculated salaries by date range")
    public ResponseEntity<List<CalculatedSalaryResponse>> getSalariesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByDateRange(startDate, endDate, pumpMasterId));
    }

    @GetMapping("/salary-config/{salaryConfigId}")
    @Operation(summary = "Get calculated salaries by salary config ID")
    public ResponseEntity<List<CalculatedSalaryResponse>> getSalariesBySalaryConfigId(
            @PathVariable UUID salaryConfigId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getBySalaryConfigId(salaryConfigId, pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create calculated salary")
    public ResponseEntity<CalculatedSalaryResponse> createSalary(
            @Valid @RequestBody CreateCalculatedSalaryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update calculated salary")
    public ResponseEntity<CalculatedSalaryResponse> updateSalary(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCalculatedSalaryRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.ok(service.update(id, request, pumpMasterId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete calculated salary")
    public ResponseEntity<Void> deleteSalary(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        service.delete(id, pumpMasterId);
        return ResponseEntity.noContent().build();
    }
}
