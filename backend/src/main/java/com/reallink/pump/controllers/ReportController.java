package com.reallink.pump.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.services.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/analytics/today")
    public ResponseEntity<Map<String, Object>> getTodayAnalytics() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        Map<String, Object> analytics = reportService.getAnalytics(startOfDay, endOfDay);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/month")
    public ResponseEntity<Map<String, Object>> getMonthAnalytics() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate lastDayOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = lastDayOfMonth.atTime(23, 59, 59);

        Map<String, Object> analytics = reportService.getAnalytics(startOfMonth, endOfMonth);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/year")
    public ResponseEntity<Map<String, Object>> getYearAnalytics() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfYear = today.with(TemporalAdjusters.firstDayOfYear());
        LocalDate lastDayOfYear = today.with(TemporalAdjusters.lastDayOfYear());

        LocalDateTime startOfYear = firstDayOfYear.atStartOfDay();
        LocalDateTime endOfYear = lastDayOfYear.atTime(23, 59, 59);

        Map<String, Object> analytics = reportService.getAnalytics(startOfYear, endOfYear);
        return ResponseEntity.ok(analytics);
    }
}
