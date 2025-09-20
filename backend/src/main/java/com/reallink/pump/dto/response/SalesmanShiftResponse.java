package com.reallink.pump.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for salesman shift assignment information")
public class SalesmanShiftResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Salesman information")
    private SalesmanSummary salesman;

    @Schema(description = "Shift information")
    private ShiftSummary shift;

    @Schema(description = "Assignment start date", example = "2024-01-15T06:00:00")
    private LocalDateTime assignmentStartDate;

    @Schema(description = "Assignment end date", example = "2024-01-15T14:00:00")
    private LocalDateTime assignmentEndDate;

    @Schema(description = "Whether assignment is currently active", example = "true")
    private Boolean isActive;

    @Schema(description = "Total sales during this shift", example = "5000.00")
    private Double totalSales;

    @Schema(description = "Number of transactions", example = "25")
    private Integer transactionCount;

    @Schema(description = "Additional notes", example = "Shift completed successfully")
    private String notes;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Record last update timestamp")
    private LocalDateTime updatedAt;

    @Data
    @Schema(description = "Salesman summary information")
    public static class SalesmanSummary {

        @Schema(description = "Salesman ID", example = "123e4567-e89b-12d3-a456-426614174000")
        private UUID id;

        @Schema(description = "Salesman name", example = "John Doe")
        private String name;

        @Schema(description = "Employee ID", example = "EMP001")
        private String employeeId;
    }

    @Data
    @Schema(description = "Shift summary information")
    public static class ShiftSummary {

        @Schema(description = "Shift ID", example = "123e4567-e89b-12d3-a456-426614174000")
        private UUID id;

        @Schema(description = "Shift name", example = "Morning Shift")
        private String name;

        @Schema(description = "Start time", example = "06:00:00")
        private String startTime;

        @Schema(description = "End time", example = "14:00:00")
        private String endTime;
    }
}
