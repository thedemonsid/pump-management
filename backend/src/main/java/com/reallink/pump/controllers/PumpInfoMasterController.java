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

import com.reallink.pump.dto.request.CreatePumpInfoMasterRequest;
import com.reallink.pump.dto.request.UpdatePumpInfoMasterRequest;
import com.reallink.pump.dto.response.PumpInfoMasterResponse;
import com.reallink.pump.services.PumpInfoMasterService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pumps")
@RequiredArgsConstructor
@Tag(name = "Pump Management", description = "APIs for managing pump information")
public class PumpInfoMasterController {

  private final PumpInfoMasterService service;

  @Operation(summary = "Get all pumps", description = "Retrieve all pumps (no pagination)")
  @GetMapping
  public ResponseEntity<List<PumpInfoMasterResponse>> getAllPumps() {
    return ResponseEntity.ok(service.getAll());
  }

  @Operation(summary = "Get pump by ID", description = "Retrieve a specific pump by its ID")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved pump"),
      @ApiResponse(responseCode = "404", description = "Pump not found"),
      @ApiResponse(responseCode = "400", description = "Invalid ID format")
  })
  @GetMapping("/{id}")
  public ResponseEntity<PumpInfoMasterResponse> getPumpById(
      @Parameter(description = "Pump ID", example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id) {
    PumpInfoMasterResponse pump = service.getById(id);
    return ResponseEntity.ok(pump);
  }

  @Operation(summary = "Get pump by code", description = "Retrieve a specific pump by its code")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved pump"),
      @ApiResponse(responseCode = "404", description = "Pump not found")
  })
  @GetMapping("/code/{pumpCode}")
  public ResponseEntity<PumpInfoMasterResponse> getPumpByCode(
      @Parameter(description = "Pump code", example = "PUMP001") @PathVariable String pumpCode) {
    PumpInfoMasterResponse pump = service.getByPumpCode(pumpCode);
    return ResponseEntity.ok(pump);
  }

  @Operation(summary = "Search pumps", description = "Search pumps by name and/or code (no pagination)")
  @GetMapping("/search")
  public ResponseEntity<List<PumpInfoMasterResponse>> searchPumps(
      @Parameter(description = "Pump name to search for") @RequestParam(required = false) String pumpName,
      @Parameter(description = "Pump code to search for") @RequestParam(required = false) String pumpCode) {
    List<PumpInfoMasterResponse> pumps = service
        .searchPumps(pumpName, pumpCode, org.springframework.data.domain.Pageable.unpaged()).getContent();
    return ResponseEntity.ok(pumps);
  }

  @Operation(summary = "Create new pump", description = "Create a new pump with the provided information")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Successfully created pump"),
      @ApiResponse(responseCode = "400", description = "Invalid request data"),
      @ApiResponse(responseCode = "409", description = "Pump with same code or ID already exists")
  })
  @PostMapping
  public ResponseEntity<PumpInfoMasterResponse> createPump(
      @Parameter(description = "Pump creation request", required = true) @Valid @RequestBody CreatePumpInfoMasterRequest request) {
    PumpInfoMasterResponse createdPump = service.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdPump);
  }

  @Operation(summary = "Update pump", description = "Update an existing pump")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully updated pump"),
      @ApiResponse(responseCode = "404", description = "Pump not found"),
      @ApiResponse(responseCode = "400", description = "Invalid request data")
  })
  @PutMapping("/{id}")
  public ResponseEntity<PumpInfoMasterResponse> updatePump(
      @Parameter(description = "Pump ID", example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id,
      @Parameter(description = "Pump update request", required = true) @Valid @RequestBody UpdatePumpInfoMasterRequest request) {
    PumpInfoMasterResponse updatedPump = service.update(id, request);
    return ResponseEntity.ok(updatedPump);
  }

  @Operation(summary = "Delete pump", description = "Delete an existing pump")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Successfully deleted pump"),
      @ApiResponse(responseCode = "404", description = "Pump not found")
  })
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePump(
      @Parameter(description = "Pump ID", example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Check if pump code exists", description = "Check if a pump with the given code exists")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Check completed", content = @Content(schema = @Schema(type = "boolean")))
  })
  @GetMapping("/exists/code/{pumpCode}")
  public ResponseEntity<Boolean> checkPumpCodeExists(
      @Parameter(description = "Pump code to check", example = "PUMP001") @PathVariable String pumpCode) {
    boolean exists = service.existsByPumpCode(pumpCode);
    return ResponseEntity.ok(exists);
  }

  @Operation(summary = "Get total pump count", description = "Get the total number of pumps")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved count", content = @Content(schema = @Schema(type = "integer", format = "int64")))
  })
  @GetMapping("/count")
  public ResponseEntity<Long> getTotalCount() {
    long count = service.getTotalCount();
    return ResponseEntity.ok(count);
  }
}
