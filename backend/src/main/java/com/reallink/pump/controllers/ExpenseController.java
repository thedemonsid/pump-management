package com.reallink.pump.controllers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import com.reallink.pump.dto.request.CreateExpenseRequest;
import com.reallink.pump.dto.request.UpdateExpenseRequest;
import com.reallink.pump.dto.response.ExpenseResponse;
import com.reallink.pump.entities.Expense.ExpenseType;
import com.reallink.pump.services.ExpenseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@Tag(name = "Expense Management", description = "APIs for managing expenses")
public class ExpenseController {

    private final ExpenseService service;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    @Operation(summary = "Get expenses by pump master ID")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByPumpMasterId(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get paginated expenses")
    public ResponseEntity<Page<ExpenseResponse>> getExpensesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expenseDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("DESC")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(service.getAllPaginated(pageable));
    }

    @GetMapping("/expense-head/{expenseHeadId}")
    @Operation(summary = "Get expenses by expense head ID")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByExpenseHeadId(@PathVariable UUID expenseHeadId) {
        return ResponseEntity.ok(service.getByExpenseHeadId(expenseHeadId));
    }

    @GetMapping("/type/{expenseType}")
    @Operation(summary = "Get expenses by expense type")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByType(@PathVariable ExpenseType expenseType) {
        return ResponseEntity.ok(service.getByExpenseType(expenseType));
    }

    @GetMapping("/type")
    @Operation(summary = "Get expenses by pump master ID and expense type")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByPumpMasterIdAndType(
            @RequestParam ExpenseType expenseType,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterIdAndExpenseType(pumpMasterId, expenseType));
    }

    @GetMapping("/nozzle-shift/{salesmanNozzleShiftId}")
    @Operation(summary = "Get expenses by salesman nozzle shift ID")
    public ResponseEntity<List<ExpenseResponse>> getExpensesBySalesmanNozzleShiftId(
            @PathVariable UUID salesmanNozzleShiftId) {
        return ResponseEntity.ok(service.getBySalesmanNozzleShiftId(salesmanNozzleShiftId));
    }

    @GetMapping("/bank-account/{bankAccountId}")
    @Operation(summary = "Get expenses by bank account ID")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByBankAccountId(@PathVariable UUID bankAccountId) {
        return ResponseEntity.ok(service.getByBankAccountId(bankAccountId));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get expenses by date range")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.getByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate));
    }

    @GetMapping("/search")
    @Operation(summary = "Search expenses with multiple criteria")
    public ResponseEntity<List<ExpenseResponse>> searchExpenses(
            @RequestParam(required = false) UUID expenseHeadId,
            @RequestParam(required = false) ExpenseType expenseType,
            @RequestParam(required = false) UUID salesmanNozzleShiftId,
            @RequestParam(required = false) UUID bankAccountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String referenceNumber,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        List<ExpenseResponse> list = service.searchExpenses(
                pumpMasterId, expenseHeadId, expenseType,
                salesmanNozzleShiftId, bankAccountId,
                startDate, endDate, referenceNumber);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/count")
    @Operation(summary = "Get total count of expenses for pump master")
    public ResponseEntity<Long> countExpenses(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.countByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/count/type/{expenseType}")
    @Operation(summary = "Get count of expenses by type for pump master")
    public ResponseEntity<Long> countExpensesByType(
            @PathVariable ExpenseType expenseType,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.countByPumpMasterIdAndExpenseType(pumpMasterId, expenseType));
    }

    @GetMapping("/sum/total")
    @Operation(summary = "Get total sum of all expense amounts for pump master")
    public ResponseEntity<BigDecimal> sumTotalExpenses(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.sumAmountByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/sum/date-range")
    @Operation(summary = "Get sum of expense amounts by date range for pump master")
    public ResponseEntity<BigDecimal> sumExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(service.sumAmountByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate));
    }

    @GetMapping("/sum/nozzle-shift/{salesmanNozzleShiftId}")
    @Operation(summary = "Get sum of expense amounts by salesman nozzle shift")
    public ResponseEntity<BigDecimal> sumExpensesBySalesmanNozzleShift(@PathVariable UUID salesmanNozzleShiftId) {
        return ResponseEntity.ok(service.sumAmountBySalesmanNozzleShiftId(salesmanNozzleShiftId));
    }

    @GetMapping("/sum/bank-account/{bankAccountId}")
    @Operation(summary = "Get sum of expense amounts by bank account and date range")
    public ResponseEntity<BigDecimal> sumExpensesByBankAccountAndDateRange(
            @PathVariable UUID bankAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(service.sumAmountByBankAccountIdAndDateRange(bankAccountId, startDate, endDate));
    }

    @PostMapping
    @Operation(summary = "Create a new expense")
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody CreateExpenseRequest request,
            HttpServletRequest httpRequest) {
        UUID pumpMasterId = extractPumpMasterId(httpRequest);
        request.setPumpMasterId(pumpMasterId);
        ExpenseResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an expense")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateExpenseRequest request) {
        ExpenseResponse response = service.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
