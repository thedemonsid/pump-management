package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing dip reading")
public class UpdateDipReadingRequest {

    @NotNull(message = "Tank ID is required")
    @Schema(description = "Tank ID for which the dip reading is recorded", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID tankId;

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @DecimalMin(value = "0.00", message = "Dip level must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Dip level must have at most 10 digits and 2 decimal places")
    @Schema(description = "Physical dip level measurement in mm or cm", example = "1500.50")
    private BigDecimal dipLevel;

    @DecimalMin(value = "0.00", message = "Density must be non-negative")
    @Digits(integer = 5, fraction = 4, message = "Density must have at most 5 digits and 4 decimal places")
    @Schema(description = "Fuel density measurement", example = "0.8450")
    private BigDecimal density;

    @Digits(integer = 5, fraction = 2, message = "Temperature must have at most 5 digits and 2 decimal places")
    @Schema(description = "Temperature measurement in Celsius", example = "25.50")
    private BigDecimal temperature;

    @DecimalMin(value = "0.00", message = "Fuel level in litres must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Fuel level litres must have at most 10 digits and 2 decimal places")
    @Schema(description = "Calculated fuel level in litres from dip reading", example = "5000.75")
    private BigDecimal fuelLevelLitres;

    @DecimalMin(value = "0.00", message = "System fuel level must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "System fuel level must have at most 10 digits and 2 decimal places")
    @Schema(description = "System calculated fuel level", example = "5001.50")
    private BigDecimal fuelLevelSystem;

    @Digits(integer = 10, fraction = 2, message = "Variance must have at most 10 digits and 2 decimal places")
    @Schema(description = "Variance between physical and system readings", example = "-0.75")
    private BigDecimal variance;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    @Schema(description = "Additional notes or observations", example = "Tank was recently refilled")
    private String remarks;
}
