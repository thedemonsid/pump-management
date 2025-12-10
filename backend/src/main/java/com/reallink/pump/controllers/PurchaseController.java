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

import com.reallink.pump.dto.request.CreatePurchaseRequest;
import com.reallink.pump.dto.request.UpdatePurchaseRequest;
import com.reallink.pump.dto.response.PurchaseResponse;
import com.reallink.pump.services.PurchaseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchase Management", description = "APIs for managing purchase information")
public class PurchaseController {

    private final PurchaseService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
        } else {
            return (UUID) pumpMasterIdObj;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping
    @Operation(summary = "Get all purchases with optional date range filter",
            description = "Retrieve all purchases. Optionally filter by date range using fromDate and toDate query parameters")
    public ResponseEntity<List<PurchaseResponse>> getAllPurchases(
            HttpServletRequest request,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        UUID pumpMasterId = extractPumpMasterId(request);

        // If date range is provided, use filtered query
        if (fromDate != null || toDate != null) {
            return ResponseEntity.ok(service.getByPumpMasterIdAndDateRange(pumpMasterId, fromDate, toDate));
        }

        // Otherwise, return all purchases
        return ResponseEntity.ok(service.getAllByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase by ID")
    public ResponseEntity<PurchaseResponse> getPurchaseById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/pump/{pumpMasterId}")
    @Operation(summary = "Get purchases by pump master ID")
    public ResponseEntity<List<PurchaseResponse>> getPurchasesByPumpMasterId(@PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Get purchases by supplier ID with optional limit")
    public ResponseEntity<List<PurchaseResponse>> getPurchasesBySupplierId(
            @PathVariable UUID supplierId,
            @RequestParam(required = false) Integer limit) {
        if (limit != null) {
            return ResponseEntity.ok(service.getBySupplierId(supplierId, limit));
        }
        return ResponseEntity.ok(service.getBySupplierId(supplierId));
    }

    @GetMapping("/pump/{pumpMasterId}/purchase/{purchaseId}")
    @Operation(summary = "Get purchase by purchase ID and pump master ID")
    public ResponseEntity<PurchaseResponse> getPurchaseByPurchaseIdAndPumpMasterId(
            @PathVariable Long purchaseId, @PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPurchaseIdAndPumpMasterId(purchaseId, pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create purchase")
    public ResponseEntity<PurchaseResponse> createPurchase(@Valid @RequestBody CreatePurchaseRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update purchase")
    public ResponseEntity<PurchaseResponse> updatePurchase(@PathVariable UUID id,
            @Valid @RequestBody UpdatePurchaseRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete purchase")
    public ResponseEntity<Void> deletePurchase(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/next-purchase-id")
    @Operation(summary = "Get next purchase ID for the current pump master")
    public ResponseEntity<Long> getNextPurchaseId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getNextPurchaseId(pumpMasterId));
    }
}
