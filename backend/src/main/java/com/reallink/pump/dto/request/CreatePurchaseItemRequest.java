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
@Schema(description = "Request DTO for creating a purchase item")
public class CreatePurchaseItemRequest {

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Schema(description = "Quantity of the product", example = "100", required = true)
    private Integer quantity;

    @NotBlank(message = "Purchase unit is required")
    @Size(max = 20, message = "Purchase unit cannot exceed 20 characters")
    @Schema(description = "Purchase unit", example = "Liters", required = true)
    private String purchaseUnit;

    @NotNull(message = "Purchase rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Purchase rate must have at most 10 digits and 2 decimal places")
    @Schema(description = "Purchase rate per unit", example = "50.00", required = true)
    private BigDecimal purchaseRate;

    @NotNull(message = "Tax percentage is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tax percentage must be non-negative")
    @Digits(integer = 5, fraction = 2, message = "Tax percentage must have at most 5 digits and 2 decimal places")
    @Schema(description = "Tax percentage", example = "18.00", required = true)
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Schema(description = "Add to stock", example = "true")
    private Boolean addToStock = false;
}
