package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new nozzle shift")
public class CreateNozzleShiftRequest {

    @NotNull(message = "Shift date is required")
    @Schema(description = "Date of the shift", example = "2025-09-15", required = true)
    private LocalDate shiftDate;

    @NotNull(message = "Opening time is required")
    @Schema(description = "Time when the shift opens", example = "08:00:00", required = true)
    private LocalTime openingTime;

    @NotNull(message = "Nozzle ID is required")
    @Schema(description = "Nozzle ID for this shift", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID nozzleId;

    @NotNull(message = "Salesman ID is required")
    @Schema(description = "Salesman ID handling this shift", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID salesmanId;

    @NotNull(message = "Opening reading is required")
    @DecimalMin(value = "0.0", message = "Opening reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening reading must have at most 12 digits and 3 decimal places")
    @Schema(description = "Reading at shift opening", example = "12345.678", required = true)
    private BigDecimal openingReading;

    @NotNull(message = "Fuel price is required")
    @DecimalMin(value = "0.0", message = "Fuel price cannot be negative")
    @Digits(integer = 8, fraction = 2, message = "Fuel price must have at most 8 digits and 2 decimal places")
    @Schema(description = "Fuel price per unit for this shift", example = "95.50", required = true)
    private BigDecimal fuelPrice;

    @Schema(description = "Next salesman ID to assign after this shift", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID nextSalesmanId;
}
