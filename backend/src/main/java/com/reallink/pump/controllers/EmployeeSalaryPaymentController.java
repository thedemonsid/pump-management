package com.reallink.pump.controllers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

import com.reallink.pump.dto.request.CreateEmployeeSalaryPaymentRequest;
import com.reallink.pump.dto.request.UpdateEmployeeSalaryPaymentRequest;
import com.reallink.pump.dto.response.EmployeeSalaryPaymentResponse;
import com.reallink.pump.services.EmployeeSalaryPaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/employee-salary-payments")
@RequiredArgsConstructor
@Tag(name = "Employee Salary Payment", description = "APIs for managing employee salary payments")
public class EmployeeSalaryPaymentController {

    private final EmployeeSalaryPaymentService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
            throw new RuntimeException("Pump master ID not found in request");
        }
        return (UUID) pumpMasterIdObj;
    }

    @GetMapping
    @Operation(summary = "Get all salary payments", description = "Retrieve all salary payments for the authenticated pump master")
    public ResponseEntity<List<EmployeeSalaryPaymentResponse>> getAllPayments(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getAllByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get salary payment by ID")
    public ResponseEntity<EmployeeSalaryPaymentResponse> getPaymentById(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getById(id, pumpMasterId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get salary payments by user ID")
    public ResponseEntity<List<EmployeeSalaryPaymentResponse>> getPaymentsByUserId(
            @PathVariable UUID userId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByUserId(userId, pumpMasterId));
    }

    @GetMapping("/user/{userId}/total")
    @Operation(summary = "Get total paid amount for user")
    public ResponseEntity<BigDecimal> getTotalPaidByUserId(
            @PathVariable UUID userId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getTotalPaidByUserId(userId, pumpMasterId));
    }

    @GetMapping("/calculated-salary/{calculatedSalaryId}")
    @Operation(summary = "Get salary payments by calculated salary ID")
    public ResponseEntity<List<EmployeeSalaryPaymentResponse>> getPaymentsByCalculatedSalaryId(
            @PathVariable UUID calculatedSalaryId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByCalculatedSalaryId(calculatedSalaryId, pumpMasterId));
    }

    @GetMapping("/calculated-salary/{calculatedSalaryId}/total")
    @Operation(summary = "Get total paid amount for calculated salary")
    public ResponseEntity<BigDecimal> getTotalPaidByCalculatedSalaryId(
            @PathVariable UUID calculatedSalaryId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getTotalPaidByCalculatedSalaryId(calculatedSalaryId, pumpMasterId));
    }

    @GetMapping("/advance")
    @Operation(summary = "Get advance payments (not linked to calculated salary)")
    public ResponseEntity<List<EmployeeSalaryPaymentResponse>> getAdvancePayments(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getAdvancePayments(pumpMasterId));
    }

    @GetMapping("/period")
    @Operation(summary = "Get total payments in period")
    public ResponseEntity<BigDecimal> getTotalPaymentsInPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getTotalPaymentsInPeriod(pumpMasterId, startDate, endDate));
    }

    @PostMapping
    @Operation(summary = "Create salary payment")
    public ResponseEntity<EmployeeSalaryPaymentResponse> createPayment(
            @Valid @RequestBody CreateEmployeeSalaryPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update salary payment")
    public ResponseEntity<EmployeeSalaryPaymentResponse> updatePayment(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmployeeSalaryPaymentRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.ok(service.update(id, request, pumpMasterId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete salary payment")
    public ResponseEntity<Void> deletePayment(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        service.delete(id, pumpMasterId);
        return ResponseEntity.noContent().build();
    }
}
