package com.reallink.pump.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.shift.AddNozzleRequest;
import com.reallink.pump.dto.shift.CloseNozzleRequest;
import com.reallink.pump.dto.shift.CreateShiftAccountingRequest;
import com.reallink.pump.dto.shift.NozzleAssignmentResponse;
import com.reallink.pump.dto.shift.ShiftDetailsResponse;
import com.reallink.pump.dto.shift.ShiftResponse;
import com.reallink.pump.dto.shift.StartShiftRequest;
import com.reallink.pump.entities.NozzleAssignment;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.entities.SalesmanShiftAccounting;
import com.reallink.pump.services.SalesmanShiftAccountingService;
import com.reallink.pump.services.SalesmanShiftService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for Salesman Shift Management. Handles shift lifecycle:
 * start, add nozzles, close nozzles, close shift.
 */
@RestController
@RequestMapping("/api/v1/salesman-shifts")
@RequiredArgsConstructor
@Slf4j
public class SalesmanShiftController {

    private final SalesmanShiftService salesmanShiftService;
    private final SalesmanShiftAccountingService accountingService;

    /**
     * Start a new shift for a salesman. POST /api/v1/salesman-shifts
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ShiftResponse> startShift(@Valid @RequestBody StartShiftRequest request) {
        log.info("Starting new shift for salesman: {}", request.getSalesmanId());

        SalesmanShift shift = salesmanShiftService.startShift(
                request.getSalesmanId(),
                request.getOpeningCash()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ShiftResponse.from(shift));
    }

    /**
     * Get all shifts (filtered by role). GET /api/v1/salesman-shifts
     *
     * Query params: - salesmanId: Filter by salesman (MANAGER/ADMIN only) -
     * status: Filter by status (OPEN, CLOSED) - fromDate: Filter from date (ISO
     * DateTime format) - toDate: Filter to date (ISO DateTime format)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<ShiftResponse>> getAllShifts(
            @RequestParam(required = false) UUID salesmanId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {

        log.info("Fetching shifts - salesmanId: {}, status: {}, from: {}, to: {}",
                salesmanId, status, fromDate, toDate);

        // Parse status if provided
        SalesmanShift.ShiftStatus shiftStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                shiftStatus = SalesmanShift.ShiftStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", status);
                // Continue with null status (no status filter)
            }
        }

        List<SalesmanShift> shifts = salesmanShiftService.getAllShifts(
                salesmanId, shiftStatus, fromDate, toDate);

        List<ShiftResponse> response = shifts.stream()
                .map(ShiftResponse::fromMinimal)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get shift by ID with full details. GET /api/v1/salesman-shifts/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ShiftDetailsResponse> getShiftById(@PathVariable UUID id) {
        log.info("Fetching shift details: {}", id);

        SalesmanShift shift = salesmanShiftService.getShiftById(id);

        return ResponseEntity.ok(ShiftDetailsResponse.fromEntity(shift));
    }

    /**
     * Get open shift for a salesman. GET
     * /api/v1/salesman-shifts/salesman/{salesmanId}/open
     */
    @GetMapping("/salesman/{salesmanId}/open")
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ShiftResponse> getOpenShift(@PathVariable UUID salesmanId) {
        log.info("Fetching open shift for salesman: {}", salesmanId);

        SalesmanShift shift = salesmanShiftService.getOpenShiftForSalesman(salesmanId);

        return ResponseEntity.ok(ShiftResponse.from(shift));
    }

    /**
     * Get all open shifts (MANAGER/ADMIN only). GET
     * /api/v1/salesman-shifts/open
     */
    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<ShiftResponse>> getAllOpenShifts() {
        log.info("Fetching all open shifts");

        List<SalesmanShift> shifts = salesmanShiftService.getAllOpenShifts();

        List<ShiftResponse> response = shifts.stream()
                .map(ShiftResponse::fromMinimal)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Close a shift. PUT /api/v1/salesman-shifts/{id}/close
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ShiftResponse> closeShift(@PathVariable UUID id) {
        log.info("Closing shift: {}", id);

        SalesmanShift shift = salesmanShiftService.closeShift(id);

        return ResponseEntity.ok(ShiftResponse.from(shift));
    }

    /**
     * Add a nozzle to a shift. POST /api/v1/salesman-shifts/{id}/nozzles
     */
    @PostMapping("/{id}/nozzles")
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<NozzleAssignmentResponse> addNozzle(
            @PathVariable UUID id,
            @Valid @RequestBody AddNozzleRequest request) {

        log.info("Adding nozzle {} to shift {}", request.getNozzleId(), id);

        NozzleAssignment assignment = salesmanShiftService.addNozzleToShift(
                id,
                request.getNozzleId(),
                request.getOpeningBalance()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(NozzleAssignmentResponse.from(assignment));
    }

    /**
     * Get all nozzles for a shift. GET /api/v1/salesman-shifts/{id}/nozzles
     */
    @GetMapping("/{id}/nozzles")
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<NozzleAssignmentResponse>> getNozzles(@PathVariable UUID id) {
        log.info("Fetching nozzles for shift: {}", id);

        List<NozzleAssignment> assignments = salesmanShiftService.getNozzleAssignmentsForShift(id);

        List<NozzleAssignmentResponse> response = assignments.stream()
                .map(NozzleAssignmentResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Close a nozzle assignment. PUT
     * /api/v1/salesman-shifts/{shiftId}/nozzles/{assignmentId}/close
     */
    @PutMapping("/{shiftId}/nozzles/{assignmentId}/close")
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<NozzleAssignmentResponse> closeNozzle(
            @PathVariable UUID shiftId,
            @PathVariable UUID assignmentId,
            @Valid @RequestBody CloseNozzleRequest request) {

        log.info("Closing nozzle assignment {} for shift {}", assignmentId, shiftId);

        NozzleAssignment assignment = salesmanShiftService.closeNozzleAssignment(
                assignmentId,
                request.getClosingBalance()
        );

        return ResponseEntity.ok(NozzleAssignmentResponse.from(assignment));
    }

    // ==================== Accounting Endpoints ====================
    /**
     * Create accounting for a shift. POST
     * /api/v1/salesman-shifts/{id}/accounting
     */
    @PostMapping("/{id}/accounting")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<SalesmanShiftAccounting> createAccounting(
            @PathVariable UUID id,
            @Valid @RequestBody CreateShiftAccountingRequest request) {

        log.info("Creating accounting for shift: {}", id);

        SalesmanShiftAccounting accounting = accountingService.createAccounting(id, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(accounting);
    }

    /**
     * Get accounting for a shift. GET /api/v1/salesman-shifts/{id}/accounting
     */
    @GetMapping("/{id}/accounting")
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<SalesmanShiftAccounting> getAccounting(@PathVariable UUID id) {
        log.info("Fetching accounting for shift: {}", id);

        SalesmanShiftAccounting accounting = accountingService.getAccounting(id);

        return ResponseEntity.ok(accounting);
    }

    /**
     * Update accounting for a shift. PUT
     * /api/v1/salesman-shifts/{id}/accounting
     */
    @PutMapping("/{id}/accounting")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<SalesmanShiftAccounting> updateAccounting(
            @PathVariable UUID id,
            @Valid @RequestBody CreateShiftAccountingRequest request) {

        log.info("Updating accounting for shift: {}", id);

        SalesmanShiftAccounting accounting = accountingService.updateAccounting(id, request);

        return ResponseEntity.ok(accounting);
    }
}
