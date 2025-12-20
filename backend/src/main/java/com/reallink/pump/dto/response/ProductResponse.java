package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.ProductType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for product information")
public class ProductResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "GST percentage", example = "18")
    private Integer gstPercentage;

    @Schema(description = "Product type", example = "FUEL")
    private ProductType productType;

    @Schema(description = "Product name", example = "Premium Gasoline")
    private String productName;

    @Schema(description = "Product alias", example = "Petrol")
    private String alias;

    @Schema(description = "Low stock alert threshold", example = "100")
    private Integer lowStockCount;

    @Schema(description = "Purchase rate per unit", example = "75.50")
    private BigDecimal purchaseRate;

    @Schema(description = "Sales rate per unit", example = "85.00")
    private BigDecimal salesRate;

    @Schema(description = "HSN code for taxation", example = "27101990")
    private String hsnCode;

    @Schema(description = "Sales unit", example = "Litre")
    private String salesUnit;

    @Schema(description = "Purchase unit", example = "Litre")
    private String purchaseUnit;

    @Schema(description = "Conversion ratio between purchase and sales units", example = "1.0000")
    private BigDecimal stockConversionRatio;

    @Schema(description = "Current stock quantity", example = "1500")
    private Integer stockQuantity;

    @Schema(description = "Opening balance for general products", example = "500")
    private Integer openingBalance;

    @Schema(description = "Number of associated tanks", example = "3")
    private Integer tankCount;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
