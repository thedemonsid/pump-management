package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import com.reallink.pump.entities.ProductType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new product")
public class CreateProductRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this product belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Product type is required")
    @Schema(description = "Product type", example = "FUEL", required = true)
    private ProductType productType;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    @Schema(description = "Product name", example = "Premium Gasoline", required = true)
    private String productName;

    @Size(max = 50, message = "Alias cannot exceed 50 characters")
    @Schema(description = "Product alias", example = "Petrol")
    private String alias;

    @Min(value = 0, message = "Low stock count cannot be negative")
    @Schema(description = "Low stock alert threshold", example = "100")
    private Integer lowStockCount;

    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Purchase rate must have at most 10 digits and 2 decimal places")
    @Schema(description = "Purchase rate per unit", example = "75.50", required = true)
    private BigDecimal purchaseRate;

    @DecimalMin(value = "0.0", inclusive = false, message = "Sales rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Sales rate must have at most 10 digits and 2 decimal places")
    @Schema(description = "Sales rate per unit", example = "85.00", required = true)
    private BigDecimal salesRate;

    @Size(max = 20, message = "HSN code cannot exceed 20 characters")
    @Schema(description = "HSN code for taxation", example = "27101990")
    private String hsnCode;

    @NotBlank(message = "Sales unit is required")
    @Size(max = 20, message = "Sales unit cannot exceed 20 characters")
    @Schema(description = "Sales unit", example = "Litre", required = true)
    private String salesUnit;

    @NotBlank(message = "Purchase unit is required")
    @Size(max = 20, message = "Purchase unit cannot exceed 20 characters")
    @Schema(description = "Purchase unit", example = "Litre", required = true)
    private String purchaseUnit;

    @DecimalMin(value = "0.0", inclusive = false, message = "Stock conversion ratio must be positive")
    @Digits(integer = 10, fraction = 4, message = "Stock conversion ratio must have at most 10 digits and 4 decimal places")
    @Schema(description = "Conversion ratio between purchase and sales units", example = "1.0000")
    private BigDecimal stockConversionRatio;
}
