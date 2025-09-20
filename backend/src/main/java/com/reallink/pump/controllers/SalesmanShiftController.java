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

import com.reallink.pump.dto.request.CreateSalesmanShiftRequest;
import com.reallink.pump.dto.request.UpdateSalesmanShiftRequest;
import com.reallink.pump.dto.response.SalesmanShiftResponse;
import com.reallink.pump.services.SalesmanShiftService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/salesman-shifts")
@RequiredArgsConstructor
@Tag(name = "Salesman Shift Management", description = "APIs for managing salesman shift assignments")
public class SalesmanShiftController {

    private final SalesmanShiftService service;

    @Operation(summary = "Get all salesman shifts", description = "Retrieve all salesman shift assignments (no pagination)")
    @GetMapping
    public ResponseEntity<List<SalesmanShiftResponse>> getAllSalesmanShifts() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Get salesman shifts by pump master ID", description = "Retrieve all salesman shifts for a specific pump master")
    @GetMapping("/pump-master/{pumpMasterId}")
    public ResponseEntity<List<SalesmanShiftResponse>> getSalesmanShiftsByPumpMasterId(@PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Get salesman shift by ID", description = "Retrieve a specific salesman shift by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<SalesmanShiftResponse> getSalesmanShiftById(@PathVariable UUID id) {
        SalesmanShiftResponse salesmanShift = service.getById(id);
        return ResponseEntity.ok(salesmanShift);
    }

    @Operation(summary = "Create new salesman shift", description = "Create a new salesman shift assignment")
    @PostMapping
    public ResponseEntity<SalesmanShiftResponse> createSalesmanShift(@Valid @RequestBody CreateSalesmanShiftRequest request) {
        SalesmanShiftResponse createdSalesmanShift = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSalesmanShift);
    }

    @Operation(summary = "Update salesman shift", description = "Update an existing salesman shift assignment")
    @PutMapping("/{id}")
    public ResponseEntity<SalesmanShiftResponse> updateSalesmanShift(@PathVariable UUID id,
            @Valid @RequestBody UpdateSalesmanShiftRequest request) {
        SalesmanShiftResponse updatedSalesmanShift = service.update(id, request);
        return ResponseEntity.ok(updatedSalesmanShift);
    }

    @Operation(summary = "Delete salesman shift", description = "Delete an existing salesman shift assignment")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalesmanShift(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
