package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a bill item")
public class CreateBillItemRequest {

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Quantity must have at most 10 digits and 2 decimal places")
    @Schema(description = "Quantity of the product", example = "10.00", required = true)
    private BigDecimal quantity;

    @NotNull(message = "Rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Rate must have at most 10 digits and 2 decimal places")
    @Schema(description = "Rate per unit", example = "100.00", required = true)
    private BigDecimal rate;

    @DecimalMin(value = "0.0", inclusive = true, message = "GST must be non-negative")
    @DecimalMax(value = "100.0", message = "GST cannot exceed 100%")
    @Digits(integer = 5, fraction = 2, message = "GST must have at most 5 digits and 2 decimal places")
    @Schema(description = "GST percentage", example = "18.00")
    private BigDecimal gst = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be non-negative")
    @DecimalMax(value = "100.0", message = "Discount cannot exceed 100%")
    @Digits(integer = 10, fraction = 2, message = "Discount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Discount percentage", example = "5.00")
    private BigDecimal discount = BigDecimal.ZERO;
}
