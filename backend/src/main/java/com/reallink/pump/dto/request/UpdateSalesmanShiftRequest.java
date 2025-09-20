package com.reallink.pump.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing salesman shift assignment")
public class UpdateSalesmanShiftRequest {

    @Schema(description = "Salesman ID to assign to shift", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanId;

    @Schema(description = "Shift ID to assign salesman to", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID shiftId;

    @Schema(description = "Assignment start date", example = "2024-01-15T06:00:00")
    private LocalDateTime assignmentStartDate;

    @Schema(description = "Assignment end date", example = "2024-01-15T14:00:00")
    private LocalDateTime assignmentEndDate;

    @Schema(description = "Whether assignment is currently active", example = "true")
    private Boolean isActive;

    @Schema(description = "Additional notes", example = "Shift completed successfully")
    private String notes;
}
