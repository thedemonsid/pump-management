package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Bill Item information")
public class BillItemResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Bill ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID billId;

    @Schema(description = "Product ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID productId;

    @Schema(description = "Product name", example = "18-TRANSACTIONAL SMS PACK 1000-0123811316")
    private String productName;

    @Schema(description = "Product HSN code", example = "123456")
    private String hsnCode;

    @Schema(description = "Sales unit", example = "Numbers")
    private String salesUnit;

    @Schema(description = "Quantity", example = "2.00")
    private BigDecimal quantity;

    @Schema(description = "Rate per unit", example = "0.177")
    private BigDecimal rate;

    @Schema(description = "Amount (quantity * rate)", example = "0.35")
    private BigDecimal amount;

    @Schema(description = "GST percentage", example = "18.00")
    private BigDecimal gst;

    @Schema(description = "Discount percentage", example = "5.00")
    private BigDecimal discount;

    @Schema(description = "Net amount", example = "0.35")
    private BigDecimal netAmount;
}
