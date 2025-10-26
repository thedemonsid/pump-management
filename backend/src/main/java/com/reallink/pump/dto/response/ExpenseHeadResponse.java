package com.reallink.pump.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Expense Head information")
public class ExpenseHeadResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Name of the expense head", example = "Fuel Purchase")
    private String headName;

    @Schema(description = "Description of the expense head", example = "Expenses related to fuel purchases")
    private String description;

    @Schema(description = "Whether the expense head is active", example = "true")
    private Boolean isActive;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "User who created the record", example = "admin")
    private String entryBy;
}
