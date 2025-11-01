package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Purchase Item information")
public class PurchaseItemResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Product ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID productId;

    @Schema(description = "Product name", example = "Diesel")
    private String productName;

    @Schema(description = "Quantity", example = "100.00")
    private BigDecimal quantity;

    @Schema(description = "Purchase unit", example = "Liters")
    private String purchaseUnit;

    @Schema(description = "Purchase rate", example = "50.00")
    private BigDecimal purchaseRate;

    @Schema(description = "Amount", example = "5000.00")
    private BigDecimal amount;

    @Schema(description = "Tax percentage", example = "18.00")
    private BigDecimal taxPercentage;

    @Schema(description = "Tax amount", example = "900.00")
    private BigDecimal taxAmount;

    @Schema(description = "Add to stock", example = "true")
    private Boolean addToStock;
}
