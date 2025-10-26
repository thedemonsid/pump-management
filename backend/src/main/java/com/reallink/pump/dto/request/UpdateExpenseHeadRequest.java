package com.reallink.pump.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an expense head")
public class UpdateExpenseHeadRequest {

    @Size(min = 2, max = 100, message = "Expense head name must be between 2 and 100 characters")
    @Schema(description = "Name of the expense head", example = "Fuel Purchase")
    private String headName;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Schema(description = "Description of the expense head", example = "Expenses related to fuel purchases")
    private String description;

    @Schema(description = "Whether the expense head is active", example = "true")
    private Boolean isActive;
}
