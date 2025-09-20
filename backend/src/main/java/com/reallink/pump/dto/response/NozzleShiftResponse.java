package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for nozzle shift information")
public class NozzleShiftResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Shift date", example = "2025-09-15")
    private LocalDate shiftDate;

    @Schema(description = "Opening time", example = "08:00:00")
    private LocalTime openingTime;

    @Schema(description = "Closing time", example = "18:00:00")
    private LocalTime closingTime;

    @Schema(description = "Nozzle ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID nozzleId;

    @Schema(description = "Salesman ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanId;

    @Schema(description = "Opening reading", example = "12345.678")
    private BigDecimal openingReading;

    @Schema(description = "Closing reading", example = "12500.123")
    private BigDecimal closingReading;

    @Schema(description = "Fuel price per unit", example = "95.50")
    private BigDecimal fuelPrice;

    @Schema(description = "Next salesman ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID nextSalesmanId;

    @Schema(description = "Calculated dispensed amount", example = "154.445")
    private BigDecimal dispensedAmount;

    @Schema(description = "Calculated total value", example = "14747.52")
    private BigDecimal totalValue;

    @Schema(description = "Whether the shift is closed")
    private boolean closed;

    @Schema(description = "Nozzle summary")
    private NozzleSummary nozzle;

    @Schema(description = "Salesman summary")
    private SalesmanSummary salesman;

    @Schema(description = "Next salesman summary")
    private SalesmanSummary nextSalesman;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Record last update timestamp")
    private LocalDateTime updatedAt;

    @Data
    @Schema(description = "Nozzle summary information")
    public static class NozzleSummary {

        @Schema(description = "Nozzle ID")
        private UUID id;
        @Schema(description = "Nozzle name")
        private String nozzleName;
        @Schema(description = "Company name")
        private String companyName;
    }

    @Data
    @Schema(description = "Salesman summary information")
    public static class SalesmanSummary {

        @Schema(description = "Salesman ID")
        private UUID id;
        @Schema(description = "Salesman name")
        private String name;
        @Schema(description = "Employee ID")
        private String employeeId;
    }
}
