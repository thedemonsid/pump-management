package com.reallink.pump.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateProductSalesUnitChangeLogRequest;
import com.reallink.pump.dto.response.ProductSalesUnitChangeLogResponse;
import com.reallink.pump.entities.ProductType;
import com.reallink.pump.services.ProductSalesUnitChangeLogService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-sales-unit-change-logs")
@RequiredArgsConstructor
public class ProductSalesUnitChangeLogController {

    private final ProductSalesUnitChangeLogService changeLogService;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    /**
     * Get all change logs for the current pump master
     */
    @GetMapping
    public ResponseEntity<List<ProductSalesUnitChangeLogResponse>> getAllChangeLogs(
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(changeLogService.getByPumpMasterId(pumpMasterId));
    }

    /**
     * Get change log by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductSalesUnitChangeLogResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(changeLogService.getById(id));
    }

    /**
     * Get all change logs for a specific product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductSalesUnitChangeLogResponse>> getByProductId(
            @PathVariable UUID productId) {
        return ResponseEntity.ok(changeLogService.getByProductId(productId));
    }

    /**
     * Get all change logs for a specific product type
     */
    @GetMapping("/product-type/{productType}")
    public ResponseEntity<List<ProductSalesUnitChangeLogResponse>> getByProductType(
            @PathVariable ProductType productType,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(changeLogService.getByPumpMasterIdAndProductType(pumpMasterId, productType));
    }

    /**
     * Get change logs within a date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<ProductSalesUnitChangeLogResponse>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(changeLogService.getByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate));
    }

    /**
     * Get change logs for a specific product within a date range
     */
    @GetMapping("/product/{productId}/date-range")
    public ResponseEntity<List<ProductSalesUnitChangeLogResponse>> getByProductIdAndDateRange(
            @PathVariable UUID productId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(changeLogService.getByProductIdAndDateRange(productId, startDate, endDate));
    }

    /**
     * Get all fuel product change logs within a date range
     */
    @GetMapping("/fuel/date-range")
    public ResponseEntity<List<ProductSalesUnitChangeLogResponse>> getFuelProductChangesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(changeLogService.getFuelProductChangesByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate));
    }

    /**
     * Get the most recent change log for a product
     */
    @GetMapping("/product/{productId}/most-recent")
    public ResponseEntity<ProductSalesUnitChangeLogResponse> getMostRecentChangeByProductId(
            @PathVariable UUID productId) {
        return ResponseEntity.ok(changeLogService.getMostRecentChangeByProductId(productId));
    }

    /**
     * Create a new change log entry
     */
    @PostMapping
    public ResponseEntity<ProductSalesUnitChangeLogResponse> create(
            @Valid @RequestBody CreateProductSalesUnitChangeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(changeLogService.create(request));
    }

    /**
     * Get count of change logs for a product
     */
    @GetMapping("/product/{productId}/count")
    public ResponseEntity<Long> getCountByProductId(@PathVariable UUID productId) {
        return ResponseEntity.ok(changeLogService.getCountByProductId(productId));
    }

    /**
     * Get count of change logs for the current pump master
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getCountByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(changeLogService.getCountByPumpMasterId(pumpMasterId));
    }
}
