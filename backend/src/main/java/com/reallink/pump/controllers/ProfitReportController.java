package com.reallink.pump.controllers;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.dto.response.ProfitReportResponse;
import com.reallink.pump.services.ProfitReportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * Controller for profit reporting APIs Restricted to ADMIN role only
 */
@RestController
@RequestMapping("/api/v1/reports/profit")
@RequiredArgsConstructor
@Tag(name = "Profit Reports", description = "APIs for generating fuel profit reports (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class ProfitReportController {

    private final ProfitReportService profitReportService;

    private UUID extractPumpMasterId(HttpServletRequest request) {
        Object pumpMasterIdObj = request.getAttribute("pumpMasterId");
        if (pumpMasterIdObj instanceof UUID uuid) {
            return uuid;
        }
        throw new RuntimeException("Pump master ID not found in request");
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's profit report",
            description = "Returns profit analysis for the current day including fuel sales, purchases, and expenses")
    public ResponseEntity<ProfitReportResponse> getTodayProfit(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(profitReportService.getTodayProfit(pumpMasterId));
    }

    @GetMapping("/month")
    @Operation(summary = "Get current month's profit report",
            description = "Returns profit analysis for the current month")
    public ResponseEntity<ProfitReportResponse> getMonthProfit(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(profitReportService.getMonthProfit(pumpMasterId));
    }

    @GetMapping("/year")
    @Operation(summary = "Get current year's profit report",
            description = "Returns profit analysis for the current year")
    public ResponseEntity<ProfitReportResponse> getYearProfit(HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(profitReportService.getYearProfit(pumpMasterId));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get profit report for a specific date",
            description = "Returns profit analysis for the specified date (YYYY-MM-DD)")
    public ResponseEntity<ProfitReportResponse> getProfitByDate(
            @PathVariable String date,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(profitReportService.getProfitByDate(pumpMasterId, localDate));
    }

    @GetMapping("/month/{year}/{month}")
    @Operation(summary = "Get profit report for a specific month",
            description = "Returns profit analysis for the specified month")
    public ResponseEntity<ProfitReportResponse> getProfitByMonth(
            @PathVariable int year,
            @PathVariable int month,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(profitReportService.getProfitByMonth(pumpMasterId, year, month));
    }

    @GetMapping("/year/{year}")
    @Operation(summary = "Get profit report for a specific year",
            description = "Returns profit analysis for the specified year")
    public ResponseEntity<ProfitReportResponse> getProfitByYear(
            @PathVariable int year,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        return ResponseEntity.ok(profitReportService.getProfitByYear(pumpMasterId, year));
    }

    @GetMapping("/range")
    @Operation(summary = "Get profit report for a custom date range",
            description = "Returns profit analysis for the specified date range (both dates in YYYY-MM-DD format)")
    public ResponseEntity<ProfitReportResponse> getProfitByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(profitReportService.getProfitByDateRange(pumpMasterId, start, end));
    }

    @GetMapping
    @Operation(summary = "Get profit report with parameters",
            description = "Generic endpoint to get profit report with period type and optional date")
    public ResponseEntity<ProfitReportResponse> getProfitReport(
            @RequestParam String periodType,
            @RequestParam(required = false) String date,
            HttpServletRequest request) {
        UUID pumpMasterId = extractPumpMasterId(request);

        return switch (periodType.toUpperCase()) {
            case "DAY" -> {
                if (date != null) {
                    LocalDate localDate = LocalDate.parse(date);
                    yield ResponseEntity.ok(profitReportService.getProfitByDate(pumpMasterId, localDate));
                }
                yield ResponseEntity.ok(profitReportService.getTodayProfit(pumpMasterId));
            }
            case "MONTH" ->
                ResponseEntity.ok(profitReportService.getMonthProfit(pumpMasterId));
            case "YEAR" ->
                ResponseEntity.ok(profitReportService.getYearProfit(pumpMasterId));
            default ->
                throw new IllegalArgumentException("Invalid period type: " + periodType + ". Must be DAY, MONTH, or YEAR");
        };
    }
}
