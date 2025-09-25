package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Bill information")
public class BillResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Bill number", example = "1001")
    private Long billNo;

    @Schema(description = "Bill date", example = "2025-09-14")
    private LocalDate billDate;

    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Customer name", example = "VISHAL")
    private String customerName;

    @Schema(description = "Rate type", example = "INCLUDING_GST")
    private RateType rateType;

    @Schema(description = "Total amount", example = "354.00")
    private BigDecimal totalAmount;

    @Schema(description = "Discount amount", example = "0.00")
    private BigDecimal discountAmount;

    @Schema(description = "Tax amount", example = "54.00")
    private BigDecimal taxAmount;

    @Schema(description = "Net amount", example = "354.00")
    private BigDecimal netAmount;

    @Schema(description = "Creation timestamp", example = "2025-09-14T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2025-09-14T10:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "List of bill items")
    private List<BillItemResponse> billItems;

    @Schema(description = "List of customer bill payments")
    private List<CustomerBillPaymentResponse> payments;
}
