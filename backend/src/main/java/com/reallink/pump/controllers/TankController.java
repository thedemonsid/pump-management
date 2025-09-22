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
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateTankRequest;
import com.reallink.pump.dto.request.UpdateTankRequest;
import com.reallink.pump.dto.response.TankResponse;
import com.reallink.pump.services.TankService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/tanks")
@Validated
@RequiredArgsConstructor
@Tag(name = "Tank Management", description = "APIs for managing tanks")
public class TankController {

    private final TankService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @Operation(summary = "Get all tanks", description = "Retrieve all tanks (no pagination)")
    @GetMapping
    public ResponseEntity<List<TankResponse>> getAllTanks(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Get tank by ID", description = "Retrieve a specific tank by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<TankResponse> getTankById(@PathVariable UUID id) {
        TankResponse tank = service.getById(id);
        return ResponseEntity.ok(tank);
    }

    @Operation(summary = "Get tanks by pump master ID", description = "Retrieve tanks by pump master ID")
    @GetMapping("/pump/{pumpMasterId}")
    public ResponseEntity<List<TankResponse>> getTanksByPumpMasterId(@PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Create new tank", description = "Create a new tank with the provided information")
    @PostMapping
    public ResponseEntity<TankResponse> createTank(@Valid @RequestBody CreateTankRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        TankResponse createdTank = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTank);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Tank")
    public ResponseEntity<TankResponse> updateTank(@PathVariable UUID id,
            @Valid @RequestBody UpdateTankRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @Operation(summary = "Delete tank", description = "Delete an existing tank")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTank(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
