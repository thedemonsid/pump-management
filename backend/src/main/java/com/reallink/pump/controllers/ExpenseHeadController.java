package com.reallink.pump.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.request.CreateExpenseHeadRequest;
import com.reallink.pump.dto.request.UpdateExpenseHeadRequest;
import com.reallink.pump.dto.response.ExpenseHeadResponse;
import com.reallink.pump.services.ExpenseHeadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/expense-heads")
@RequiredArgsConstructor
@Tag(name = "Expense Head Management", description = "APIs for managing expense head categories")
public class ExpenseHeadController {

    private final ExpenseHeadService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense head by ID")
    public ResponseEntity<ExpenseHeadResponse> getExpenseHeadById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get expense heads by pump master ID")
    public ResponseEntity<List<ExpenseHeadResponse>> getExpenseHeadsByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active expense heads by pump master ID")
    public ResponseEntity<List<ExpenseHeadResponse>> getActiveExpenseHeadsByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getActiveByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get paginated expense heads")
    public ResponseEntity<Page<ExpenseHeadResponse>> getExpenseHeadsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "headName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(service.getAllPaginated(pageable));
    }

    @GetMapping("/name/{headName}")
    @Operation(summary = "Get expense head by name and pump master ID")
    public ResponseEntity<ExpenseHeadResponse> getExpenseHeadByNameAndPumpMasterId(
            @PathVariable String headName, HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByHeadNameAndPumpMasterId(headName, pumpMasterId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search expense heads")
    public ResponseEntity<List<ExpenseHeadResponse>> searchExpenseHeads(
            @RequestParam(required = false) String headName,
            @RequestParam(required = false) Boolean isActive,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<ExpenseHeadResponse> list = service.searchExpenseHeads(headName, isActive, pumpMasterId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/count")
    @Operation(summary = "Get total count of expense heads for pump master")
    public ResponseEntity<Long> countExpenseHeads(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.countByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/count/active")
    @Operation(summary = "Get count of active expense heads for pump master")
    public ResponseEntity<Long> countActiveExpenseHeads(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.countActiveByPumpMasterId(pumpMasterId));
    }

    @PostMapping
    @Operation(summary = "Create a new expense head")
    public ResponseEntity<ExpenseHeadResponse> createExpenseHead(
            @Valid @RequestBody CreateExpenseHeadRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        ExpenseHeadResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an expense head")
    public ResponseEntity<ExpenseHeadResponse> updateExpenseHead(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateExpenseHeadRequest request) {
        ExpenseHeadResponse response = service.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense head")
    public ResponseEntity<Void> deleteExpenseHead(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Toggle active status of an expense head")
    public ResponseEntity<ExpenseHeadResponse> toggleActive(@PathVariable UUID id) {
        ExpenseHeadResponse response = service.toggleActive(id);
        return ResponseEntity.ok(response);
    }
}
