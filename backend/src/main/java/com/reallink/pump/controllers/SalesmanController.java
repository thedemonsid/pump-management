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

import com.reallink.pump.dto.request.CreateSalesmanRequest;
import com.reallink.pump.dto.request.UpdateSalesmanRequest;
import com.reallink.pump.dto.response.SalesmanResponse;
import com.reallink.pump.services.SalesmanService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/salesmen")
@RequiredArgsConstructor
@Tag(name = "Salesman Management", description = "APIs for managing salesmen")
public class SalesmanController {

    private final SalesmanService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
            throw new RuntimeException("Pump master ID not found in request");
        }
        return (UUID) pumpMasterIdObj;
    }

    @GetMapping
    @Operation(summary = "Get all salesmen", description = "Retrieve all salesmen for the authenticated pump master")
    public ResponseEntity<List<SalesmanResponse>> getAllSalesmen(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getAllByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get salesman by ID")
    public ResponseEntity<SalesmanResponse> getSalesmanById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create salesman")
    public ResponseEntity<SalesmanResponse> createSalesman(@Valid @RequestBody CreateSalesmanRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, pumpMasterId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update salesman")
    public ResponseEntity<SalesmanResponse> updateSalesman(@PathVariable UUID id,
            @Valid @RequestBody UpdateSalesmanRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete salesman")
    public ResponseEntity<Void> deleteSalesman(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
