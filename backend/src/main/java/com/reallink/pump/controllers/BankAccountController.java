package com.reallink.pump.controllers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

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

import com.reallink.pump.dto.request.CreateBankAccountRequest;
import com.reallink.pump.dto.request.CreateBankTransactionRequest;
import com.reallink.pump.dto.request.UpdateBankAccountRequest;
import com.reallink.pump.dto.response.BankAccountResponse;
import com.reallink.pump.dto.response.BankTransactionResponse;
import com.reallink.pump.services.BankAccountService;
import com.reallink.pump.services.BankTransactionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bank-accounts")
@RequiredArgsConstructor
@Tag(name = "Bank Account Management", description = "APIs for managing bank account information")
public class BankAccountController {

    private final BankAccountService service;
    private final BankTransactionService transactionService;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bank account by ID")
    public ResponseEntity<BankAccountResponse> getBankAccountById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get bank accounts by pump master ID")
    public ResponseEntity<List<BankAccountResponse>> getBankAccountsByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/account/{accountNumber}")
    @Operation(summary = "Get bank account by account number")
    public ResponseEntity<BankAccountResponse> getBankAccountByAccountNumberAndPumpMasterId(
            @PathVariable String accountNumber, HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByAccountNumberAndPumpMasterId(accountNumber, pumpMasterId));
    }

    @GetMapping("/bank/{bank}")
    @Operation(summary = "Get bank accounts by bank name")
    public ResponseEntity<List<BankAccountResponse>> getBankAccountsByBankAndPumpMasterId(
            @PathVariable String bank, HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByBankAndPumpMasterId(bank, pumpMasterId));
    }

    @GetMapping("/ifsc/{ifscCode}")
    @Operation(summary = "Get bank accounts by IFSC code")
    public ResponseEntity<List<BankAccountResponse>> getBankAccountsByIfscCodeAndPumpMasterId(
            @PathVariable String ifscCode, HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByIfscCodeAndPumpMasterId(ifscCode, pumpMasterId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search bank accounts")
    public ResponseEntity<List<BankAccountResponse>> searchBankAccounts(
            @RequestParam(required = false) String accountHolderName,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) String ifscCode,
            @RequestParam(required = false) String bank,
            @RequestParam(required = false) String branch,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<BankAccountResponse> list = service.searchBankAccounts(accountHolderName, accountNumber, ifscCode, bank, branch, pumpMasterId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @Operation(summary = "Create bank account")
    public ResponseEntity<BankAccountResponse> createBankAccount(@Valid @RequestBody CreateBankAccountRequest request, HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update bank account")
    public ResponseEntity<BankAccountResponse> updateBankAccount(@PathVariable UUID id,
            @Valid @RequestBody UpdateBankAccountRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete bank account")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{bankAccountId}/opening-balance")
    @Operation(summary = "Get opening balance for ledger")
    public ResponseEntity<BigDecimal> getOpeningBalance(
            @PathVariable UUID bankAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        BigDecimal openingBalance = service.getOpeningBalance(bankAccountId, date);
        return ResponseEntity.ok(openingBalance);
    }

    @GetMapping("/{bankAccountId}/transactions")
    @Operation(summary = "Get transactions for a bank account with date filtering")
    public ResponseEntity<List<BankTransactionResponse>> getTransactions(
            @PathVariable UUID bankAccountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<BankTransactionResponse> transactions;
        if (fromDate != null && toDate != null) {
            transactions = transactionService.getTransactionsByBankAccountIdAndDateRange(bankAccountId, fromDate, toDate);
        } else {
            transactions = transactionService.getTransactionsByBankAccountId(bankAccountId);
        }
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/{bankAccountId}/credit")
    @Operation(summary = "Credit amount to bank account")
    public ResponseEntity<BankTransactionResponse> creditAccount(@PathVariable UUID bankAccountId,
            @Valid @RequestBody CreateBankTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createCreditTransaction(bankAccountId, request));
    }

    @PostMapping("/{bankAccountId}/debit")
    @Operation(summary = "Debit amount from bank account")
    public ResponseEntity<BankTransactionResponse> debitAccount(@PathVariable UUID bankAccountId,
            @Valid @RequestBody CreateBankTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createDebitTransaction(bankAccountId, request));
    }
}
