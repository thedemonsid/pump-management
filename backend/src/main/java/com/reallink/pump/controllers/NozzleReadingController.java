package com.reallink.pump.controllers;

import java.time.LocalDate;
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

import com.reallink.pump.dto.request.CreateNozzleReadingRequest;
import com.reallink.pump.dto.request.UpdateNozzleReadingRequest;
import com.reallink.pump.dto.response.NozzleReadingResponse;
import com.reallink.pump.services.NozzleReadingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/nozzle-readings")
@RequiredArgsConstructor
@Tag(name = "Nozzle Reading Management", description = "APIs for managing nozzle readings")
public class NozzleReadingController {

    private final NozzleReadingService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (!(pumpMasterIdObj instanceof UUID)) {
        } else {
            return (UUID) pumpMasterIdObj;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @Operation(summary = "Get nozzle readings by date", description = "Retrieve nozzle readings for a specific date")
    @GetMapping("/date/{date}")
    public ResponseEntity<List<NozzleReadingResponse>> getNozzleReadingsByDate(@PathVariable LocalDate date, HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByDateAndPumpMasterId(date, pumpMasterId));
    }

    @Operation(summary = "Get nozzle reading by ID", description = "Retrieve a specific nozzle reading by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<NozzleReadingResponse> getNozzleReadingById(@PathVariable UUID id) {
        NozzleReadingResponse nozzleReading = service.getById(id);
        return ResponseEntity.ok(nozzleReading);
    }

    @Operation(summary = "Create new nozzle reading", description = "Create a new nozzle reading record")
    @PostMapping
    public ResponseEntity<NozzleReadingResponse> createNozzleReading(@Valid @RequestBody CreateNozzleReadingRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        NozzleReadingResponse createdNozzleReading = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNozzleReading);
    }

    @Operation(summary = "Update nozzle reading", description = "Update an existing nozzle reading")
    @PutMapping("/{id}")
    public ResponseEntity<NozzleReadingResponse> updateNozzleReading(@PathVariable UUID id,
            @Valid @RequestBody UpdateNozzleReadingRequest request) {
        NozzleReadingResponse updatedNozzleReading = service.update(id, request);
        return ResponseEntity.ok(updatedNozzleReading);
    }

    @Operation(summary = "Delete nozzle reading", description = "Delete an existing nozzle reading")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNozzleReading(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
