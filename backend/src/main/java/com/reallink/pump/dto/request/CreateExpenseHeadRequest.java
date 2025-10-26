package com.reallink.pump.dto.request;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new expense head")
public class CreateExpenseHeadRequest {

    @Schema(description = "Pump Master ID this expense head belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotBlank(message = "Expense head name is required")
    @Size(min = 2, max = 100, message = "Expense head name must be between 2 and 100 characters")
    @Schema(description = "Name of the expense head", example = "Fuel Purchase", required = true)
    private String headName;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Schema(description = "Description of the expense head", example = "Expenses related to fuel purchases")
    private String description;

    @Schema(description = "Whether the expense head is active", example = "true", defaultValue = "true")
    private Boolean isActive = true;
}
