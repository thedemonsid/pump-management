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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateFuelPurchaseRequest;
import com.reallink.pump.dto.request.UpdateFuelPurchaseRequest;
import com.reallink.pump.dto.response.FuelPurchaseResponse;
import com.reallink.pump.services.FuelPurchaseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/fuel-purchases")
@RequiredArgsConstructor
@Tag(name = "Fuel Purchase Management", description = "APIs for managing fuel purchase information")
public class FuelPurchaseController {

    private final FuelPurchaseService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get fuel purchase by ID")
    public ResponseEntity<FuelPurchaseResponse> getFuelPurchaseById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get fuel purchases by pump master ID with optional date range filter")
    public ResponseEntity<List<FuelPurchaseResponse>> getFuelPurchasesByPumpMasterId(
            HttpServletRequest request,
            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fromDate,
            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate toDate) {
        UUID pumpMasterId = extractPumpMasterId(request);

        // If date range is provided, use the filtered query for better performance
        if (fromDate != null || toDate != null) {
            return ResponseEntity.ok(service.getByPumpMasterIdAndDateRange(pumpMasterId, fromDate, toDate));
        }

        // Otherwise, return all records
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Get fuel purchases by supplier ID with optional limit")
    public ResponseEntity<List<FuelPurchaseResponse>> getFuelPurchasesBySupplierId(
            @PathVariable UUID supplierId,
            @RequestParam(required = false) Integer limit) {
        if (limit != null) {
            return ResponseEntity.ok(service.getBySupplierId(supplierId, limit));
        }
        return ResponseEntity.ok(service.getBySupplierId(supplierId));
    }

    @GetMapping("/fuel-purchase/{fuelPurchaseId}")
    @Operation(summary = "Get fuel purchase by fuel purchase ID")
    public ResponseEntity<FuelPurchaseResponse> getFuelPurchaseByFuelPurchaseIdAndPumpMasterId(
            @PathVariable Long fuelPurchaseId, HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByFuelPurchaseIdAndPumpMasterId(fuelPurchaseId, pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create fuel purchase")
    public ResponseEntity<FuelPurchaseResponse> createFuelPurchase(@Valid @RequestBody CreateFuelPurchaseRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update fuel purchase")
    public ResponseEntity<FuelPurchaseResponse> updateFuelPurchase(@PathVariable UUID id,
            @Valid @RequestBody UpdateFuelPurchaseRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete fuel purchase")
    public ResponseEntity<Void> deleteFuelPurchase(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
