package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for SalesmanBill information")
public class SalesmanBillResponse {

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

    @Schema(description = "Salesman ID (optional)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanId;

    @Schema(description = "Salesman name (optional)", example = "John Doe")
    private String salesmanName;

    @Schema(description = "Payment type", example = "CREDIT")
    private PaymentType paymentType;

    @Schema(description = "Net amount", example = "354.00")
    private BigDecimal netAmount;

    @Schema(description = "Creation timestamp", example = "2025-09-14T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2025-09-14T10:00:00")
    private LocalDateTime updatedAt;
}
