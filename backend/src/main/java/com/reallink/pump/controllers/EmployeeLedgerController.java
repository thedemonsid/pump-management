package com.reallink.pump.controllers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.response.EmployeeLedgerResponse;
import com.reallink.pump.services.EmployeeLedgerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/employees")
@Validated
@RequiredArgsConstructor
@Tag(name = "Employee Ledger Management", description = "APIs for managing employee salary ledger")
public class EmployeeLedgerController {

    private final EmployeeLedgerService employeeLedgerService;

    @GetMapping("/{userId}/ledger")
    @Operation(summary = "Get employee salary ledger with date range filtering")
    public ResponseEntity<EmployeeLedgerResponse> getEmployeeLedger(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        EmployeeLedgerResponse ledger = employeeLedgerService.getEmployeeLedger(userId, fromDate, toDate);
        return ResponseEntity.ok(ledger);
    }

    @GetMapping("/{userId}/opening-balance")
    @Operation(summary = "Get employee opening balance at a specific date")
    public ResponseEntity<BigDecimal> getOpeningBalance(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        BigDecimal openingBalance = employeeLedgerService.getOpeningBalance(userId, date);
        return ResponseEntity.ok(openingBalance);
    }

    @GetMapping("/{userId}/current-balance")
    @Operation(summary = "Get employee current balance as of a specific date")
    public ResponseEntity<BigDecimal> getCurrentBalance(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        BigDecimal currentBalance = employeeLedgerService.getCurrentBalance(userId, asOfDate);
        return ResponseEntity.ok(currentBalance);
    }
}
