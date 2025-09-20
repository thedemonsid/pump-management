package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing nozzle")
public class UpdateNozzleRequest {

    @Size(min = 2, max = 50, message = "Nozzle name must be between 2 and 50 characters")
    @Schema(description = "Nozzle name", example = "Nozzle 1")
    private String nozzleName;

    @Size(max = 100, message = "Company name cannot exceed 100 characters")
    @Schema(description = "Manufacturer company name", example = "Petrol Pump Systems")
    private String companyName;

    @DecimalMin(value = "0.0", message = "Current reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Current reading must have at most 12 digits and 3 decimal places")
    @Schema(description = "Current reading", example = "12345.678")
    private BigDecimal currentReading;

    @Size(max = 50, message = "Location cannot exceed 50 characters")
    @Schema(description = "Physical location of nozzle", example = "Island 1 - Left")
    private String location;

    @Schema(description = "Tank ID this nozzle is connected to", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID tankId;
}
