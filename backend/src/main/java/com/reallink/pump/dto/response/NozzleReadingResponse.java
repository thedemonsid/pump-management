package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for nozzle reading information")
public class NozzleReadingResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Associated nozzle ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID nozzleId;

    @Schema(description = "Nozzle name", example = "Nozzle 1")
    private String nozzleName;

    @Schema(description = "Reading value in litres", example = "12345.678")
    private BigDecimal reading;

    @Schema(description = "Previous reading for comparison", example = "12300.456")
    private BigDecimal previousReading;

    @Schema(description = "Difference from previous reading", example = "45.222")
    private BigDecimal difference;

    @Schema(description = "Reading timestamp")
    private LocalDateTime readingDateTime;

    @Schema(description = "Salesman who took the reading")
    private SalesmanSummary salesman;

    @Schema(description = "Shift during which reading was taken")
    private ShiftSummary shift;

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
    }
}
