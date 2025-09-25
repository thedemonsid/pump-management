package com.reallink.pump.controllers;

import java.math.BigDecimal;
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

import com.reallink.pump.dto.request.CreateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.response.SalesmanBillPaymentResponse;
import com.reallink.pump.services.SalesmanBillPaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/salesman-bill-payments")
@RequiredArgsConstructor
@Tag(name = "Salesman Bill Payment Management", description = "APIs for managing salesman bill payments")
public class SalesmanBillPaymentController {

    private final SalesmanBillPaymentService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get salesman bill payment by ID")
    public ResponseEntity<SalesmanBillPaymentResponse> getSalesmanBillPaymentById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get all salesman bill payments")
    public ResponseEntity<List<SalesmanBillPaymentResponse>> getAllSalesmanBillPayments() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/shift/{salesmanNozzleShiftId}")
    @Operation(summary = "Get payments collected during a specific salesman nozzle shift")
    public ResponseEntity<List<SalesmanBillPaymentResponse>> getPaymentsBySalesmanNozzleShiftId(@PathVariable UUID salesmanNozzleShiftId) {
        return ResponseEntity.ok(service.getBySalesmanNozzleShiftId(salesmanNozzleShiftId));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get payments by customer ID")
    public ResponseEntity<List<SalesmanBillPaymentResponse>> getPaymentsByCustomerId(@PathVariable UUID customerId) {
        return ResponseEntity.ok(service.getByCustomerId(customerId));
    }

    @PostMapping
    @Operation(summary = "Create salesman bill payment")
    public ResponseEntity<SalesmanBillPaymentResponse> createSalesmanBillPayment(@Valid @RequestBody CreateSalesmanBillPaymentRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update salesman bill payment")
    public ResponseEntity<SalesmanBillPaymentResponse> updateSalesmanBillPayment(@PathVariable UUID id, @Valid @RequestBody UpdateSalesmanBillPaymentRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete salesman bill payment")
    public ResponseEntity<Void> deleteSalesmanBillPayment(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/shift/{salesmanNozzleShiftId}/total")
    @Operation(summary = "Get total payments collected during a salesman nozzle shift")
    public ResponseEntity<BigDecimal> getTotalPaymentsForShift(@PathVariable UUID salesmanNozzleShiftId) {
        return ResponseEntity.ok(service.getTotalPaymentsForShift(salesmanNozzleShiftId));
    }
}
