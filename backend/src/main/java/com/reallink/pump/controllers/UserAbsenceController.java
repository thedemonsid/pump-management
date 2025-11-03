package com.reallink.pump.controllers;

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

import com.reallink.pump.dto.request.CreateUserAbsenceRequest;
import com.reallink.pump.dto.request.UpdateUserAbsenceRequest;
import com.reallink.pump.dto.response.UserAbsenceResponse;
import com.reallink.pump.services.UserAbsenceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/user-absences")
@RequiredArgsConstructor
@Tag(name = "User Absence Management", description = "APIs for managing user absence records")
public class UserAbsenceController {

    private final UserAbsenceService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
            throw new RuntimeException("Pump master ID not found in request");
        }
        return (UUID) pumpMasterIdObj;
    }

    @GetMapping
    @Operation(summary = "Get all user absences", description = "Retrieve all user absence records for the authenticated pump master")
    public ResponseEntity<List<UserAbsenceResponse>> getAllAbsences(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getAllByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user absence by ID")
    public ResponseEntity<UserAbsenceResponse> getAbsenceById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get absences by user ID")
    public ResponseEntity<List<UserAbsenceResponse>> getAbsencesByUserId(
            @PathVariable UUID userId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByUserId(userId, pumpMasterId));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get absences by date range")
    public ResponseEntity<List<UserAbsenceResponse>> getAbsencesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByDateRange(startDate, endDate, pumpMasterId));
    }

    @GetMapping("/approval-status")
    @Operation(summary = "Get absences by approval status")
    public ResponseEntity<List<UserAbsenceResponse>> getAbsencesByApprovalStatus(
            @RequestParam Boolean isApproved,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByApprovalStatus(isApproved, pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create user absence record")
    public ResponseEntity<UserAbsenceResponse> createAbsence(
            @Valid @RequestBody CreateUserAbsenceRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, pumpMasterId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user absence record")
    public ResponseEntity<UserAbsenceResponse> updateAbsence(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserAbsenceRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user absence record")
    public ResponseEntity<Void> deleteAbsence(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
