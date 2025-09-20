package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new nozzle reading")
public class CreateNozzleReadingRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Nozzle ID is required")
    @Schema(description = "Nozzle ID for which reading is taken", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID nozzleId;

    @NotNull(message = "Reading value is required")
    @DecimalMin(value = "0.0", message = "Reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Reading must have at most 12 digits and 3 decimal places")
    @Schema(description = "Reading value in litres", example = "12345.678", required = true)
    private BigDecimal reading;

    @Schema(description = "Reading timestamp (if not provided, current time will be used)", example = "2024-01-15T10:30:00")
    private LocalDateTime readingDateTime;

    @Schema(description = "Salesman ID who took the reading", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanId;

    @Schema(description = "Shift ID during which reading was taken", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID shiftId;

    @Schema(description = "Additional notes about the reading", example = "Reading taken after pump maintenance")
    private String notes;
}
