package com.reallink.pump.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CloseSalesmanNozzleShiftRequest;
import com.reallink.pump.dto.request.CreateSalesmanNozzleShiftRequest;
import com.reallink.pump.dto.request.UpdateSalesmanNozzleShiftRequest;
import com.reallink.pump.dto.response.SalesmanNozzleShiftResponse;
import com.reallink.pump.services.SalesmanNozzleShiftService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/salesman-nozzle-shifts")
@RequiredArgsConstructor
@Tag(name = "Salesman Nozzle Shift Management", description = "APIs for managing salesman nozzle shifts")
public class SalesmanNozzleShiftController {

    private final SalesmanNozzleShiftService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
            throw new RuntimeException("Pump master ID not found in request");
        }
        return (UUID) pumpMasterIdObj;
    }

    @GetMapping
    @Operation(summary = "Get all salesman nozzle shifts", description = "Retrieve all salesman nozzle shifts for the authenticated pump master, optionally filtered by date range")
    public ResponseEntity<List<SalesmanNozzleShiftResponse>> getAllSalesmanNozzleShifts(
            HttpServletRequest request,
            @Parameter(description = "From date (inclusive) in ISO format (yyyy-MM-dd'T'HH:mm:ss)", example = "2023-10-01T00:00:00")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @Parameter(description = "To date (inclusive) in ISO format (yyyy-MM-dd'T'HH:mm:ss)", example = "2023-10-31T23:59:59")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @Parameter(description = "Salesman ID to filter shifts by specific salesman")
            @RequestParam(required = false) UUID salesmanId) {
        UUID pumpMasterId = extractPumpMasterId(request);

        List<SalesmanNozzleShiftResponse> shifts;
        if (salesmanId != null) {
            shifts = service.getBySalesmanIdAndPumpMasterId(salesmanId, pumpMasterId, fromDate, toDate);
        } else {
            shifts = service.getAllByPumpMasterId(pumpMasterId, fromDate, toDate);
        }

        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/open")
    @Operation(summary = "Get open salesman nozzle shifts", description = "Retrieve all open salesman nozzle shifts for the authenticated pump master, optionally filtered by specific salesman")
    public ResponseEntity<List<SalesmanNozzleShiftResponse>> getOpenSalesmanNozzleShifts(
            HttpServletRequest request,
            @Parameter(description = "Salesman ID to filter open shifts by specific salesman")
            @RequestParam(required = false) UUID salesmanId) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<SalesmanNozzleShiftResponse> shifts = service.getOpenShifts(pumpMasterId, salesmanId);
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get salesman nozzle shift by ID")
    public ResponseEntity<SalesmanNozzleShiftResponse> getSalesmanNozzleShiftById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/nozzle/{nozzleId}")
    @Operation(summary = "Get shifts by nozzle ID", description = "Retrieve all shifts for a specific nozzle")
    public ResponseEntity<List<SalesmanNozzleShiftResponse>> getShiftsByNozzleId(@PathVariable UUID nozzleId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<SalesmanNozzleShiftResponse> shifts = service.getByNozzleId(nozzleId, pumpMasterId);
        return ResponseEntity.ok(shifts);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Create salesman nozzle shift")
    public ResponseEntity<SalesmanNozzleShiftResponse> createSalesmanNozzleShift(@Valid @RequestBody CreateSalesmanNozzleShiftRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, pumpMasterId));
    }

    @PutMapping("/{id}/close")
    @Operation(summary = "Close salesman nozzle shift")
    public ResponseEntity<SalesmanNozzleShiftResponse> closeSalesmanNozzleShift(@PathVariable UUID id,
            @Valid @RequestBody CloseSalesmanNozzleShiftRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.ok(service.closeShift(id, request, pumpMasterId));
    }

    // Admin endpoints
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin create salesman nozzle shift")
    public ResponseEntity<SalesmanNozzleShiftResponse> adminCreateSalesmanNozzleShift(@Valid @RequestBody CreateSalesmanNozzleShiftRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.adminCreateShift(request, pumpMasterId));
    }

    @PutMapping("/{id}/admin/close")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin close salesman nozzle shift")
    public ResponseEntity<SalesmanNozzleShiftResponse> adminCloseSalesmanNozzleShift(@PathVariable UUID id,
            @Valid @RequestBody CloseSalesmanNozzleShiftRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.ok(service.adminCloseShift(id, request, pumpMasterId));
    }

    @PutMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin update salesman nozzle shift")
    public ResponseEntity<SalesmanNozzleShiftResponse> adminUpdateSalesmanNozzleShift(@PathVariable UUID id,
            @Valid @RequestBody UpdateSalesmanNozzleShiftRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.ok(service.adminUpdateShift(id, request, pumpMasterId));
    }

    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin delete salesman nozzle shift")
    public ResponseEntity<Void> adminDeleteSalesmanNozzleShift(@PathVariable UUID id,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        service.adminDeleteShift(id, pumpMasterId);
        return ResponseEntity.noContent().build();
    }
}
