package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new tank")
public class CreateTankRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this tank belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotBlank(message = "Tank name is required")
    @Size(min = 2, max = 100, message = "Tank name must be between 2 and 100 characters")
    @Schema(description = "Tank name", example = "Tank 1 - Premium", required = true)
    private String tankName;

    @NotNull(message = "Capacity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Capacity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Capacity must have at most 10 digits and 2 decimal places")
    @Schema(description = "Tank capacity in litres", example = "5000.00", required = true)
    private BigDecimal capacity;

    @DecimalMin(value = "0.0", message = "Current level cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Current level must have at most 10 digits and 2 decimal places")
    @Schema(description = "Current level in litres", example = "2500.00")
    private BigDecimal currentLevel;

    @DecimalMin(value = "0.0", message = "Low level alert cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Low level alert must have at most 10 digits and 2 decimal places")
    @Schema(description = "Low level alert threshold in litres", example = "500.00")
    private BigDecimal lowLevelAlert;

    @Size(max = 50, message = "Tank location cannot exceed 50 characters")
    @Schema(description = "Tank physical location", example = "Underground - Section A")
    private String tankLocation;

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID this tank stores", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID productId;
}
