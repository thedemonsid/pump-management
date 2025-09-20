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

import com.reallink.pump.dto.request.CreateSupplierRequest;
import com.reallink.pump.dto.request.UpdateSupplierRequest;
import com.reallink.pump.dto.response.SupplierResponse;
import com.reallink.pump.services.SupplierService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
@Tag(name = "Supplier Management", description = "APIs for managing supplier information")
public class SupplierController {

    private final SupplierService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
        } else {
            return (UUID) pumpMasterIdObj;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get suppliers by pump master ID")
    public ResponseEntity<List<SupplierResponse>> getSuppliersByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search suppliers")
    public ResponseEntity<List<SupplierResponse>> searchSuppliers(
            @RequestParam(required = false) String supplierName,
            @RequestParam(required = false) String contactPersonName,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String gstNumber,
            @RequestParam(required = false) String taxIdentificationNumber,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<SupplierResponse> list = service.searchSuppliers(supplierName, contactPersonName, address, gstNumber,
                taxIdentificationNumber, pumpMasterId);
        return ResponseEntity.ok(list);
    }

    // @GetMapping("/search/name")
    // @Operation(summary = "Search suppliers by name (partial match)")
    // public ResponseEntity<List<SupplierResponse>>
    // searchSuppliersByName(@RequestParam String supplierName) {
    // return ResponseEntity.ok(service.getBySupplierNameContaining(supplierName));
    // }
    //
    // @GetMapping("/search/contact")
    // @Operation(summary = "Search suppliers by contact person name (partial
    // match)")
    // public ResponseEntity<List<SupplierResponse>>
    // searchSuppliersByContactPerson(@RequestParam String contactPersonName) {
    // return
    // ResponseEntity.ok(service.getByContactPersonNameContaining(contactPersonName));
    // }
    @PostMapping
    @Operation(summary = "Create supplier")
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody CreateSupplierRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update supplier")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable UUID id,
            @Valid @RequestBody UpdateSupplierRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete supplier")
    public ResponseEntity<Void> deleteSupplier(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exists")
    @Operation(summary = "Check if supplier exists by name and pump master")
    public ResponseEntity<Boolean> existsBySupplierNameAndPumpMasterId(
            @RequestParam String supplierName,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.existsBySupplierNameAndPumpMasterId(supplierName, pumpMasterId));
    }

    // @GetMapping("/count/pump/{pumpMasterId}")
    // @Operation(summary = "Get supplier count by pump master ID")
    // public ResponseEntity<Long> getSupplierCountByPumpMasterId(@PathVariable UUID
    // pumpMasterId) {
    // return ResponseEntity.ok(service.getCountByPumpMasterId(pumpMasterId));
    // }
    //
    // @GetMapping("/distinct/contact-persons")
    // @Operation(summary = "Get distinct contact person names")
    // public ResponseEntity<List<String>> getDistinctContactPersonNames() {
    // return ResponseEntity.ok(service.getDistinctContactPersonNames());
    // }
}
