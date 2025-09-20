package com.reallink.pump.controllers;

import java.time.LocalDate;
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

import com.reallink.pump.dto.request.CreateNozzleShiftRequest;
import com.reallink.pump.dto.request.UpdateNozzleShiftRequest;
import com.reallink.pump.dto.response.NozzleShiftResponse;
import com.reallink.pump.services.NozzleShiftService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/nozzle-shifts")
@RequiredArgsConstructor
@Tag(name = "Nozzle Shift Management", description = "APIs for managing nozzle shift readings and assignments")
public class NozzleShiftController {

    private final NozzleShiftService service;

    @Operation(summary = "Get all nozzle shifts", description = "Retrieve all nozzle shifts without pagination")
    @GetMapping("/all")
    public ResponseEntity<List<NozzleShiftResponse>> getAllNozzleShifts() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Get nozzle shift by ID", description = "Retrieve a specific nozzle shift by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<NozzleShiftResponse> getNozzleShiftById(@PathVariable UUID id) {
        NozzleShiftResponse shift = service.getById(id);
        return ResponseEntity.ok(shift);
    }

    @Operation(summary = "Get shifts by nozzle ID", description = "Retrieve all shifts for a specific nozzle")
    @GetMapping("/nozzle/{nozzleId}")
    public ResponseEntity<List<NozzleShiftResponse>> getShiftsByNozzleId(@PathVariable UUID nozzleId) {
        return ResponseEntity.ok(service.getByNozzleId(nozzleId));
    }

    @Operation(summary = "Get shifts by salesman ID", description = "Retrieve all shifts for a specific salesman")
    @GetMapping("/salesman/{salesmanId}")
    public ResponseEntity<List<NozzleShiftResponse>> getShiftsBySalesmanId(@PathVariable UUID salesmanId) {
        return ResponseEntity.ok(service.getBySalesmanId(salesmanId));
    }

    @Operation(summary = "Get shifts by date", description = "Retrieve all shifts for a specific date")
    @GetMapping("/date")
    public ResponseEntity<List<NozzleShiftResponse>> getShiftsByDate(
            @Parameter(description = "Shift date in YYYY-MM-DD format") @RequestParam LocalDate date) {
        return ResponseEntity.ok(service.getByShiftDate(date));
    }

    @Operation(summary = "Get open shifts", description = "Retrieve all currently open (unclosed) shifts")
    @GetMapping("/open")
    public ResponseEntity<List<NozzleShiftResponse>> getOpenShifts() {
        return ResponseEntity.ok(service.getOpenShifts());
    }

    @Operation(summary = "Create a new nozzle shift", description = "Create a new shift with opening readings")
    @PostMapping
    public ResponseEntity<NozzleShiftResponse> createNozzleShift(@Valid @RequestBody CreateNozzleShiftRequest request) {
        NozzleShiftResponse createdShift = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdShift);
    }

    @Operation(summary = "Update a nozzle shift", description = "Update shift details, including closing the shift")
    @PutMapping("/{id}")
    public ResponseEntity<NozzleShiftResponse> updateNozzleShift(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateNozzleShiftRequest request) {
        NozzleShiftResponse updatedShift = service.update(id, request);
        return ResponseEntity.ok(updatedShift);
    }

    @Operation(summary = "Delete a nozzle shift", description = "Delete a nozzle shift by its ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNozzleShift(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
