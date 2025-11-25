package com.reallink.pump.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.reallink.pump.dto.shift.CreateShiftAccountingRequest;
import com.reallink.pump.dto.response.SalesmanShiftAccountingResponse;
import com.reallink.pump.entities.SalesmanShiftAccounting;
import com.reallink.pump.mapper.SalesmanShiftAccountingMapper;
import com.reallink.pump.services.SalesmanShiftAccountingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/salesman-shift-accounting")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SalesmanShiftAccountingController {

    private final SalesmanShiftAccountingService service;
    private final SalesmanShiftAccountingMapper mapper;

    /**
     * Get accounting by shift ID
     */
    @GetMapping("/shift/{shiftId}")
    public ResponseEntity<SalesmanShiftAccountingResponse> getByShiftId(@PathVariable UUID shiftId) {
        SalesmanShiftAccounting accounting = service.getAccounting(shiftId);
        return ResponseEntity.ok(mapper.toResponse(accounting));
    }

    /**
     * Create accounting for a shift
     */
    @PostMapping("/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','SALESMAN')")
    public ResponseEntity<SalesmanShiftAccountingResponse> create(
            @PathVariable UUID shiftId,
            @Valid @RequestBody CreateShiftAccountingRequest request) {
        SalesmanShiftAccounting accounting = service.createAccounting(shiftId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(accounting));
    }

    /**
     * Update accounting
     */
    @PutMapping("/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<SalesmanShiftAccountingResponse> update(
            @PathVariable UUID shiftId,
            @Valid @RequestBody CreateShiftAccountingRequest request) {
        SalesmanShiftAccounting accounting = service.updateAccounting(shiftId, request);
        return ResponseEntity.ok(mapper.toResponse(accounting));
    }

    /**
     * Delete accounting
     */
    @DeleteMapping("/shift/{shiftId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable UUID shiftId) {
        service.deleteAccounting(shiftId);
        return ResponseEntity.noContent().build();
    }
}
