package com.reallink.pump.controllers;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
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

import com.reallink.pump.dto.request.CreateCustomerBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateCustomerBillPaymentRequest;
import com.reallink.pump.dto.response.CustomerBillPaymentResponse;
import com.reallink.pump.services.CustomerBillPaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/customer-bill-payments")
@RequiredArgsConstructor
@Tag(name = "Customer Bill Payment Management", description = "APIs for managing customer bill payments")
public class CustomerBillPaymentController {

    private final CustomerBillPaymentService service;

    @GetMapping
    @Operation(summary = "Get all customer bill payments", description = "Retrieve all customer bill payments")
    public ResponseEntity<List<CustomerBillPaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/customer/{customerId}")

    @Operation(summary = "Get all customer bill payments by customerId", description = "Retrieve all customer bill payments")
    public ResponseEntity<List<CustomerBillPaymentResponse>> getAllPaymentsByCustomerId(@PathVariable UUID customerId) {
        return ResponseEntity.ok(service.getAllByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer bill payment by ID")
    public ResponseEntity<CustomerBillPaymentResponse> getPaymentById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/pump/{pumpMasterId}")
    @Operation(summary = "Get payments by pump master ID")
    public ResponseEntity<List<CustomerBillPaymentResponse>> getPaymentsByPumpMasterId(@PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/bill/{billId}")
    @Operation(summary = "Get payments by bill ID")
    public ResponseEntity<List<CustomerBillPaymentResponse>> getPaymentsByBillId(@PathVariable UUID billId) {
        return ResponseEntity.ok(service.getByBillId(billId));
    }

    @GetMapping("/pump/{pumpMasterId}/general")
    @Operation(summary = "Get general payments (without specific bills) by pump master ID")
    public ResponseEntity<List<CustomerBillPaymentResponse>> getGeneralPaymentsByPumpMasterId(
            @PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getGeneralPaymentsByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get customer bill payments by date range", description = "Retrieve all customer bill payments between fromDate and toDate")
    public ResponseEntity<List<CustomerBillPaymentResponse>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(service.getByDateRange(fromDate, toDate));
    }

    @PostMapping
    @Operation(summary = "Create customer bill payment")
    public ResponseEntity<CustomerBillPaymentResponse> createPayment(
            @Valid @RequestBody CreateCustomerBillPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer bill payment")
    public ResponseEntity<CustomerBillPaymentResponse> updatePayment(@PathVariable UUID id,
            @Valid @RequestBody UpdateCustomerBillPaymentRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer bill payment")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
