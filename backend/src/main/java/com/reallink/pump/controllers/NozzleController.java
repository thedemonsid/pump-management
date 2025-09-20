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

import com.reallink.pump.dto.request.CreateNozzleRequest;
import com.reallink.pump.dto.request.UpdateNozzleRequest;
import com.reallink.pump.dto.response.NozzleResponse;
import com.reallink.pump.services.NozzleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/nozzles")
@RequiredArgsConstructor
@Tag(name = "Nozzle Management", description = "APIs for managing nozzle information")
public class NozzleController {

    private final NozzleService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID uuid)) {
        } else {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @Operation(summary = "Get nozzle by ID", description = "Retrieve a specific nozzle by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<NozzleResponse> getNozzleById(@PathVariable UUID id) {
        NozzleResponse nozzle = service.getById(id);
        return ResponseEntity.ok(nozzle);
    }

    @Operation(summary = "Get nozzles by pump master ID", description = "Retrieve nozzles by pump master ID")
    @GetMapping
    public ResponseEntity<List<NozzleResponse>> getNozzlesByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @Operation(summary = "Create new nozzle", description = "Create a new nozzle with the provided information")
    @PostMapping
    public ResponseEntity<NozzleResponse> createNozzle(@Valid @RequestBody CreateNozzleRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        NozzleResponse createdNozzle = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNozzle);
    }

    @Operation(summary = "Update nozzle", description = "Update an existing nozzle")
    @PutMapping("/{id}")
    public ResponseEntity<NozzleResponse> updateNozzle(@PathVariable UUID id,
            @Valid @RequestBody UpdateNozzleRequest request) {
        NozzleResponse updatedNozzle = service.update(id, request);
        return ResponseEntity.ok(updatedNozzle);
    }

    @Operation(summary = "Delete nozzle", description = "Delete an existing nozzle")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNozzle(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
