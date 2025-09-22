package com.reallink.pump.controllers;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateTankTransactionRequest;
import com.reallink.pump.dto.response.TankTransactionResponse;
import com.reallink.pump.services.TankTransactionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tanks")
@Validated
@RequiredArgsConstructor
@Tag(name = "Tank Transaction Management", description = "APIs for managing tank transactions (fuel purchases)")
public class TankTransactionController {

    private final TankTransactionService transactionService;

    @GetMapping("/{tankId}/transactions")
    @Operation(summary = "Get transactions for a tank with date filtering")
    public ResponseEntity<List<TankTransactionResponse>> getTransactions(
            @PathVariable UUID tankId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<TankTransactionResponse> transactions;
        if (fromDate != null && toDate != null) {
            transactions = transactionService.getTransactionsByTankIdAndDateRange(tankId, fromDate, toDate);
        } else {
            transactions = transactionService.getTransactionsByTankId(tankId);
        }
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/{tankId}/addition")
    @Operation(summary = "Add fuel to tank (fuel purchase)")
    public ResponseEntity<TankTransactionResponse> addFuel(@PathVariable UUID tankId,
            @Valid @RequestBody CreateTankTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createAdditionTransaction(tankId, request));
    }

    @PostMapping("/{tankId}/removal")
    @Operation(summary = "Remove fuel from tank")
    public ResponseEntity<TankTransactionResponse> removeFuel(@PathVariable UUID tankId,
            @Valid @RequestBody CreateTankTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createRemovalTransaction(tankId, request));
    }
}
