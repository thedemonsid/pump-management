package com.reallink.pump.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
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

import com.reallink.pump.dto.request.CreateDipReadingRequest;
import com.reallink.pump.dto.request.UpdateDipReadingRequest;
import com.reallink.pump.dto.response.DipReadingResponse;
import com.reallink.pump.services.DipReadingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/dip-readings")
@Validated
@RequiredArgsConstructor
@Tag(name = "Dip Reading Management", description = "APIs for managing tank dip readings")
public class DipReadingController {

    private final DipReadingService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @Operation(
            summary = "Get dip readings with date range filter",
            description = "Retrieve dip readings for the pump master within a specified date range (paginated)"
    )
    @GetMapping
    public ResponseEntity<Page<DipReadingResponse>> getDipReadings(
            @Parameter(description = "Start date for filtering", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date for filtering", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        Pageable pageable = PageRequest.of(page, size);
        Page<DipReadingResponse> dipReadings = service.getByPumpMasterIdWithDateRange(
                pumpMasterId, startDate, endDate, pageable
        );
        return ResponseEntity.ok(dipReadings);
    }

    @Operation(
            summary = "Get dip readings by tank with date range",
            description = "Retrieve dip readings for a specific tank within a date range"
    )
    @GetMapping("/tank/{tankId}")
    public ResponseEntity<List<DipReadingResponse>> getDipReadingsByTank(
            @Parameter(description = "Tank ID", required = true)
            @PathVariable UUID tankId,
            @Parameter(description = "Start date for filtering", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date for filtering", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<DipReadingResponse> dipReadings = service.getByTankIdAndDateRange(
                tankId, pumpMasterId, startDate, endDate
        );
        return ResponseEntity.ok(dipReadings);
    }

    @Operation(
            summary = "Get dip readings by tank with date range (paginated)",
            description = "Retrieve dip readings for a specific tank within a date range with pagination"
    )
    @GetMapping("/tank/{tankId}/paginated")
    public ResponseEntity<Page<DipReadingResponse>> getDipReadingsByTankPaginated(
            @Parameter(description = "Tank ID", required = true)
            @PathVariable UUID tankId,
            @Parameter(description = "Start date for filtering", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date for filtering", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        Pageable pageable = PageRequest.of(page, size);
        Page<DipReadingResponse> dipReadings = service.getByTankIdAndDateRangePaginated(
                tankId, pumpMasterId, startDate, endDate, pageable
        );
        return ResponseEntity.ok(dipReadings);
    }

    @Operation(
            summary = "Get latest dip reading for a tank",
            description = "Retrieve the most recent dip reading for a specific tank"
    )
    @GetMapping("/tank/{tankId}/latest")
    public ResponseEntity<DipReadingResponse> getLatestDipReading(
            @Parameter(description = "Tank ID", required = true)
            @PathVariable UUID tankId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        DipReadingResponse dipReading = service.getLatestByTankId(tankId, pumpMasterId);
        return ResponseEntity.ok(dipReading);
    }

    @Operation(
            summary = "Get dip reading by ID",
            description = "Retrieve a specific dip reading by its ID"
    )
    @GetMapping("/{id}")
    public ResponseEntity<DipReadingResponse> getDipReadingById(
            @Parameter(description = "Dip Reading ID", required = true)
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        DipReadingResponse dipReading = service.getById(id, pumpMasterId);
        return ResponseEntity.ok(dipReading);
    }

    @Operation(
            summary = "Get dip readings with high variance",
            description = "Retrieve dip readings where variance exceeds the specified threshold"
    )
    @GetMapping("/high-variance")
    public ResponseEntity<List<DipReadingResponse>> getHighVarianceReadings(
            @Parameter(description = "Variance threshold", required = true)
            @RequestParam Double threshold,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<DipReadingResponse> dipReadings = service.getReadingsWithHighVariance(pumpMasterId, threshold);
        return ResponseEntity.ok(dipReadings);
    }

    @Operation(
            summary = "Get count of dip readings for a tank",
            description = "Get the total count of dip readings recorded for a specific tank"
    )
    @GetMapping("/tank/{tankId}/count")
    public ResponseEntity<Long> getDipReadingCount(
            @Parameter(description = "Tank ID", required = true)
            @PathVariable UUID tankId,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        long count = service.countByTankId(tankId, pumpMasterId);
        return ResponseEntity.ok(count);
    }

    @Operation(
            summary = "Create new dip reading",
            description = "Create a new dip reading for a tank"
    )
    @PostMapping
    public ResponseEntity<DipReadingResponse> createDipReading(
            @Valid @RequestBody CreateDipReadingRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        DipReadingResponse createdDipReading = service.create(request, pumpMasterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDipReading);
    }

    @Operation(
            summary = "Update dip reading",
            description = "Update an existing dip reading"
    )
    @PutMapping("/{id}")
    public ResponseEntity<DipReadingResponse> updateDipReading(
            @Parameter(description = "Dip Reading ID", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDipReadingRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        DipReadingResponse updatedDipReading = service.update(id, request, pumpMasterId);
        return ResponseEntity.ok(updatedDipReading);
    }

    @Operation(
            summary = "Delete dip reading",
            description = "Delete a dip reading by its ID"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDipReading(
            @Parameter(description = "Dip Reading ID", required = true)
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        service.delete(id, pumpMasterId);
        return ResponseEntity.noContent().build();
    }
}
