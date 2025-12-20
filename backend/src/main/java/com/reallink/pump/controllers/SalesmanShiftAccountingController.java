package com.reallink.pump.controllers;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

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
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.response.SalesmanShiftAccountingResponse;
import com.reallink.pump.dto.shift.CashDistributionRequest;
import com.reallink.pump.dto.shift.CashDistributionResponse;
import com.reallink.pump.dto.shift.CreateShiftAccountingRequest;
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

    // ==================== CASH DISTRIBUTION ENDPOINTS ====================
    /**
     * Distribute cash from shift accounting to bank accounts
     */
    @PostMapping("/shift/{shiftId}/distributions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<CashDistributionResponse>> distributeCash(
            @PathVariable UUID shiftId,
            @Valid @RequestBody CashDistributionRequest request) {
        List<CashDistributionResponse> distributions = service.distributeCash(shiftId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(distributions);
    }

    /**
     * Get all cash distributions for a shift
     */
    @GetMapping("/shift/{shiftId}/distributions")
    public ResponseEntity<List<CashDistributionResponse>> getCashDistributions(@PathVariable UUID shiftId) {
        List<CashDistributionResponse> distributions = service.getCashDistributions(shiftId);
        return ResponseEntity.ok(distributions);
    }

    /**
     * Get total distributed amount for a shift
     */
    @GetMapping("/shift/{shiftId}/distributions/total")
    public ResponseEntity<BigDecimal> getTotalDistributed(@PathVariable UUID shiftId) {
        BigDecimal total = service.getTotalDistributed(shiftId);
        return ResponseEntity.ok(total);
    }

    /**
     * Delete all cash distributions for a shift
     */
    @DeleteMapping("/shift/{shiftId}/distributions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteCashDistributions(@PathVariable UUID shiftId) {
        service.deleteCashDistributions(shiftId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete a single cash distribution transaction
     */
    @DeleteMapping("/distributions/{transactionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteCashDistribution(@PathVariable UUID transactionId) {
        service.deleteCashDistribution(transactionId);
        return ResponseEntity.noContent().build();
    }
}
