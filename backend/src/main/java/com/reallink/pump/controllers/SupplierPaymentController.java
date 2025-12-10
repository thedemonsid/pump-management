package com.reallink.pump.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateSupplierPaymentRequest;
import com.reallink.pump.dto.request.UpdateSupplierPaymentRequest;
import com.reallink.pump.dto.response.SupplierPaymentResponse;
import com.reallink.pump.services.SupplierPaymentService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/supplier-payments")
@Validated
@RequiredArgsConstructor
public class SupplierPaymentController {

    private final SupplierPaymentService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
        } else {
            return (UUID) pumpMasterIdObj;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping
    public ResponseEntity<List<SupplierPaymentResponse>> getAll(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<SupplierPaymentResponse> payments = service.getAllByPumpMasterId(pumpMasterId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierPaymentResponse> getById(@PathVariable @NotNull UUID id) {
        SupplierPaymentResponse payment = service.getById(id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/pump-master/{pumpMasterId}")
    public ResponseEntity<List<SupplierPaymentResponse>> getByPumpMasterId(@PathVariable @NotNull UUID pumpMasterId) {
        List<SupplierPaymentResponse> payments = service.getByPumpMasterId(pumpMasterId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<SupplierPaymentResponse>> getBySupplierId(
            @PathVariable @NotNull UUID supplierId,
            @RequestParam(required = false) Integer limit) {
        if (limit != null) {
            return ResponseEntity.ok(service.getBySupplierId(supplierId, limit));
        }
        return ResponseEntity.ok(service.getBySupplierId(supplierId));
    }

    @GetMapping("/purchase/{purchaseId}")
    public ResponseEntity<List<SupplierPaymentResponse>> getByPurchaseId(@PathVariable @NotNull UUID purchaseId) {
        List<SupplierPaymentResponse> payments = service.getByPurchaseId(purchaseId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/fuel-purchase/{fuelPurchaseId}")
    public ResponseEntity<List<SupplierPaymentResponse>> getByFuelPurchaseId(@PathVariable @NotNull UUID fuelPurchaseId) {
        List<SupplierPaymentResponse> payments = service.getByFuelPurchaseId(fuelPurchaseId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/general/pump-master/{pumpMasterId}")
    public ResponseEntity<List<SupplierPaymentResponse>> getGeneralPaymentsByPumpMasterId(@PathVariable @NotNull UUID pumpMasterId) {
        List<SupplierPaymentResponse> payments = service.getGeneralPaymentsByPumpMasterId(pumpMasterId);
        return ResponseEntity.ok(payments);
    }

    @PostMapping
    public ResponseEntity<SupplierPaymentResponse> create(@Valid @RequestBody CreateSupplierPaymentRequest request) {
        SupplierPaymentResponse payment = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierPaymentResponse> update(@PathVariable @NotNull UUID id, @Valid @RequestBody UpdateSupplierPaymentRequest request) {
        SupplierPaymentResponse payment = service.update(id, request);
        return ResponseEntity.ok(payment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @NotNull UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
