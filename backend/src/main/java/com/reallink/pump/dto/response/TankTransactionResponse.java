package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.TankTransaction;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for tank transaction")
public class TankTransactionResponse {

    @Schema(description = "Transaction ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Tank ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID tankId;

    @Schema(description = "Tank name", example = "Tank 1 - Premium")
    private String tankName;

    @Schema(description = "Transaction type", example = "ADDITION")
    private TankTransaction.TransactionType transactionType;

    @Schema(description = "Transaction volume", example = "1000.00")
    private BigDecimal volume;

    @Schema(description = "Transaction description", example = "Fuel purchase from supplier")
    private String description;

    @Schema(description = "Entry by user", example = "admin")
    private String entryBy;

    @Schema(description = "Transaction date and time", example = "2023-12-01T10:30:00")
    private LocalDateTime transactionDate;

    @Schema(description = "Supplier name", example = "ABC Fuel Suppliers")
    private String supplierName;

    @Schema(description = "Invoice number", example = "INV-2023-001")
    private String invoiceNumber;

    @Schema(description = "Fuel purchase ID if transaction originated from fuel purchase", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID fuelPurchaseId;

    @Schema(description = "Fuel purchase invoice number if transaction originated from fuel purchase", example = "FP-2023-001")
    private String fuelPurchaseInvoiceNumber;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
