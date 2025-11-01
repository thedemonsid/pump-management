package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.reallink.pump.entities.PaymentType;
import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Purchase information")
public class PurchaseResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Purchase ID", example = "1")
    private Long purchaseId;

    @Schema(description = "Purchase date", example = "2023-10-01")
    private LocalDate purchaseDate;

    @Schema(description = "Rate type", example = "INCLUDING_GST")
    private RateType rateType;

    @Schema(description = "Payment type", example = "CASH")
    private PaymentType paymentType;

    @Schema(description = "Supplier ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID supplierId;

    @Schema(description = "Supplier name", example = "ABC Suppliers")
    private String supplierName;

    @Schema(description = "Invoice number", example = "INV001")
    private String invoiceNumber;

    @Schema(description = "Goods received by", example = "John Doe")
    private String goodsReceivedBy;

    @Schema(description = "Total amount", example = "10000.00")
    private BigDecimal totalAmount;

    @Schema(description = "Tax amount", example = "1800.00")
    private BigDecimal taxAmount;

    @Schema(description = "Net amount", example = "11800.00")
    private BigDecimal netAmount;

    @Schema(description = "Purchase items")
    private List<PurchaseItemResponse> purchaseItems = new ArrayList<>();

    @Schema(description = "Supplier payments")
    private List<SupplierPaymentResponse> supplierPayments = new ArrayList<>();

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Version number", example = "1")
    private Long version;
}
