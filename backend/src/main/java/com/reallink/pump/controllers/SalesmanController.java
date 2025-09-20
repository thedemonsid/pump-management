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
@Tag(name = "Salesman Management", description = "APIs for managing salesman information")
public class SalesmanController {

    private final SalesmanService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @Operation(summary = "Get all salesmen", description = "Retrieve all salesmen (no pagination)")
    @GetMapping
    public ResponseEntity<List<SalesmanResponse>> getAllSalesmen(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Get salesmen by pump master ID", description = "Retrieve all salesmen for a specific pump master")
    @GetMapping("/pump-master/{pumpMasterId}")
    public ResponseEntity<List<SalesmanResponse>> getSalesmenByPumpMasterId(@PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Get salesman by ID", description = "Retrieve a specific salesman by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<SalesmanResponse> getSalesmanById(@PathVariable UUID id) {
        SalesmanResponse salesman = service.getById(id);
        return ResponseEntity.ok(salesman);
    }

    @Operation(summary = "Create new salesman", description = "Create a new salesman with the provided information")
    @PostMapping
    public ResponseEntity<SalesmanResponse> createSalesman(@Valid @RequestBody CreateSalesmanRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        SalesmanResponse createdSalesman = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSalesman);
    }

    @Operation(summary = "Update salesman", description = "Update an existing salesman")
    @PutMapping("/{id}")
    public ResponseEntity<SalesmanResponse> updateSalesman(@PathVariable UUID id,
            @Valid @RequestBody UpdateSalesmanRequest request) {
        SalesmanResponse updatedSalesman = service.update(id, request);
        return ResponseEntity.ok(updatedSalesman);
    }

    @Operation(summary = "Delete salesman", description = "Delete an existing salesman")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalesman(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
