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

import com.reallink.pump.dto.request.CreateBillItemRequest;
import com.reallink.pump.dto.request.CreateBillRequest;
import com.reallink.pump.dto.request.UpdateBillRequest;
import com.reallink.pump.dto.response.BillItemResponse;
import com.reallink.pump.dto.response.BillResponse;
import com.reallink.pump.services.BillService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
@Tag(name = "Bill Management", description = "APIs for managing bills")
public class BillController {

    private final BillService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bill by ID")
    public ResponseEntity<BillResponse> getBillById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get bills by pump master ID")
    public ResponseEntity<List<BillResponse>> getBillsByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get bills by pump master ID within a date range")
    public ResponseEntity<List<BillResponse>> getBillsByPumpMasterIdAndDateRange(
            @RequestParam @NotNull LocalDate startDate,
            @RequestParam @NotNull LocalDate endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate));
    }

    // Get Bills by Customer ID
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get bills by customer ID")
    public ResponseEntity<List<BillResponse>> getBillsByCustomerId(
            @PathVariable UUID customerId,
            @RequestParam(required = false) Integer limit) {
        if (limit != null) {
            return ResponseEntity.ok(service.getByCustomerId(customerId, limit));
        }
        return ResponseEntity.ok(service.getByCustomerId(customerId));
    }

    @GetMapping("/next-bill-no")
    @Operation(summary = "Get next bill number for pump master")
    public ResponseEntity<Long> getNextBillNo(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getNextBillNo(pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create bill")
    public ResponseEntity<BillResponse> createBill(@Valid @RequestBody CreateBillRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        request.setBillNo(service.getNextBillNo(pumpMasterId));
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update bill")
    public ResponseEntity<BillResponse> updateBill(@PathVariable UUID id, @Valid @RequestBody UpdateBillRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete bill")
    public ResponseEntity<Void> deleteBill(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/items/{billItemId}")
    @Operation(summary = "Delete a bill item from a bill and recalculate totals")
    public ResponseEntity<Void> deleteBillItem(@PathVariable UUID billItemId) {
        service.deleteBillItem(billItemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{billId}/items")
    @Operation(summary = "Create a bill item for a bill and recalculate totals")
    public ResponseEntity<BillItemResponse> createBillItem(@PathVariable UUID billId, @Valid @RequestBody CreateBillItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createBillItem(billId, request));
    }

    @PutMapping("/items/{billItemId}")
    @Operation(summary = "Update a bill item and recalculate totals")
    public ResponseEntity<BillItemResponse> updateBillItem(@PathVariable UUID billItemId, @Valid @RequestBody CreateBillItemRequest request) {
        return ResponseEntity.ok(service.updateBillItem(billItemId, request));
    }
}
