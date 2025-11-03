package com.reallink.pump.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateManagerRequest;
import com.reallink.pump.dto.request.UpdateManagerRequest;
import com.reallink.pump.dto.response.ManagerResponse;
import com.reallink.pump.services.ManagerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/managers")
@RequiredArgsConstructor
@Tag(name = "Manager Management", description = "APIs for managing managers")
public class ManagerController {

    private final ManagerService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
            throw new RuntimeException("Pump master ID not found in request");
        }
        return (UUID) pumpMasterIdObj;
    }

    @GetMapping
    @Operation(summary = "Get all managers", description = "Retrieve all managers for the authenticated pump master")
    public ResponseEntity<List<ManagerResponse>> getAllManagers(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getAllByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get manager by ID")
    public ResponseEntity<ManagerResponse> getManagerById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create manager")
    public ResponseEntity<ManagerResponse> createManager(@Valid @RequestBody CreateManagerRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, pumpMasterId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update manager")
    public ResponseEntity<ManagerResponse> updateManager(@PathVariable UUID id,
            @Valid @RequestBody UpdateManagerRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }
}
