package com.reallink.pump.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new salesman shift assignment")
public class CreateSalesmanShiftRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Salesman ID is required")
    @Schema(description = "Salesman ID to assign to shift", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID salesmanId;

    @NotNull(message = "Shift ID is required")
    @Schema(description = "Shift ID to assign salesman to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID shiftId;

    @Schema(description = "Assignment start date (if not provided, current time will be used)", example = "2024-01-15T06:00:00")
    private LocalDateTime assignmentStartDate;

    @Schema(description = "Assignment end date", example = "2024-01-15T14:00:00")
    private LocalDateTime assignmentEndDate;

    @Schema(description = "Additional notes", example = "Regular shift assignment")
    private String notes;
}
