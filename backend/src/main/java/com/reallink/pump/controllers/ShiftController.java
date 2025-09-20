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
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateShiftRequest;
import com.reallink.pump.dto.request.UpdateShiftRequest;
import com.reallink.pump.dto.response.ShiftResponse;
import com.reallink.pump.services.ShiftService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/shifts")
@RequiredArgsConstructor
@Tag(name = "Shift Management", description = "APIs for managing shift information")
public class ShiftController {

    private final ShiftService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @Operation(summary = "Get all shifts", description = "Retrieve all shifts (no pagination)")
    @GetMapping
    public ResponseEntity<List<ShiftResponse>> getAllShifts(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Get shifts by pump master ID", description = "Retrieve all shifts for a specific pump master")
    @GetMapping("/pump-master/{pumpMasterId}")
    public ResponseEntity<List<ShiftResponse>> getShiftsByPumpMasterId(@PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Get shift by ID", description = "Retrieve a specific shift by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<ShiftResponse> getShiftById(@PathVariable UUID id) {
        ShiftResponse shift = service.getById(id);
        return ResponseEntity.ok(shift);
    }

    @Operation(summary = "Create new shift", description = "Create a new shift with the provided information")
    @PostMapping
    public ResponseEntity<ShiftResponse> createShift(@Valid @RequestBody CreateShiftRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        ShiftResponse createdShift = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdShift);
    }

    @Operation(summary = "Update shift", description = "Update an existing shift")
    @PutMapping("/{id}")
    public ResponseEntity<ShiftResponse> updateShift(@PathVariable UUID id,
            @Valid @RequestBody UpdateShiftRequest request) {
        ShiftResponse updatedShift = service.update(id, request);
        return ResponseEntity.ok(updatedShift);
    }

    @Operation(summary = "Delete shift", description = "Delete an existing shift")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShift(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
