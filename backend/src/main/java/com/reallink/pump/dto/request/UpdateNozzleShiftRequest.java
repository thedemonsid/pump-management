package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a nozzle shift")
public class UpdateNozzleShiftRequest {

    @Schema(description = "Time when the shift closes", example = "18:00:00")
    private LocalTime closingTime;

    @DecimalMin(value = "0.0", message = "Closing reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing reading must have at most 12 digits and 3 decimal places")
    @Schema(description = "Reading at shift closing", example = "12500.123")
    private BigDecimal closingReading;

    @DecimalMin(value = "0.0", message = "Fuel price cannot be negative")
    @Digits(integer = 8, fraction = 2, message = "Fuel price must have at most 8 digits and 2 decimal places")
    @Schema(description = "Updated fuel price per unit", example = "96.00")
    private BigDecimal fuelPrice;

    @Schema(description = "Next salesman ID to assign after this shift", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID nextSalesmanId;
}
