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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateSalesmanBillRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillRequest;
import com.reallink.pump.dto.response.SalesmanBillResponse;
import com.reallink.pump.services.SalesmanBillService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/salesman-bills")
@RequiredArgsConstructor
@Tag(name = "Salesman Bill Management", description = "APIs for managing salesman bills")
public class SalesmanBillController {

    private final SalesmanBillService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get salesman bill by ID")
    public ResponseEntity<SalesmanBillResponse> getSalesmanBillById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get salesman bills by pump master ID")
    public ResponseEntity<List<SalesmanBillResponse>> getSalesmanBillsByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get salesman bills by pump master ID within a date range")
    public ResponseEntity<List<SalesmanBillResponse>> getSalesmanBillsByPumpMasterIdAndDateRange(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate));
    }

    // Get Salesman Bills by Customer ID
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get salesman bills by customer ID")
    public ResponseEntity<List<SalesmanBillResponse>> getSalesmanBillsByCustomerId(@PathVariable UUID customerId) {
        return ResponseEntity.ok(service.getByCustomerId(customerId));
    }

    @GetMapping("/next-bill-no")
    @Operation(summary = "Get next salesman bill number for pump master")
    public ResponseEntity<Long> getNextSalesmanBillNo(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getNextBillNo(pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create salesman bill")
    public ResponseEntity<SalesmanBillResponse> createSalesmanBill(@Valid @RequestBody CreateSalesmanBillRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        request.setBillNo(service.getNextBillNo(pumpMasterId));
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update salesman bill")
    public ResponseEntity<SalesmanBillResponse> updateSalesmanBill(@PathVariable UUID id, @Valid @RequestBody UpdateSalesmanBillRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete salesman bill")
    public ResponseEntity<Void> deleteSalesmanBill(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
