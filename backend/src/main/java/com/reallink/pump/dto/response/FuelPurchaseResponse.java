package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentType;
import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Fuel Purchase information")
public class FuelPurchaseResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Fuel Purchase ID", example = "1")
    private Long fuelPurchaseId;

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

    @Schema(description = "Add to stock", example = "true")
    private Boolean addToStock;

    @Schema(description = "Tank ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID tankId;

    @Schema(description = "Tank name", example = "Tank A")
    private String tankName;

    @Schema(description = "Product ID (from tank)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID productId;

    @Schema(description = "Product name (from tank)", example = "Petrol")
    private String productName;

    @Schema(description = "Quantity", example = "100.00")
    private BigDecimal quantity;

    @Schema(description = "Purchase rate", example = "50.00")
    private BigDecimal purchaseRate;

    @Schema(description = "Amount", example = "5000.00")
    private BigDecimal amount;

    @Schema(description = "Vehicle", example = "Truck ABC")
    private String vehicle;

    @Schema(description = "Goods received by", example = "John Doe")
    private String goodsReceivedBy;

    @Schema(description = "Purchase unit", example = "Liters")
    private String purchaseUnit;

    @Schema(description = "Tax percentage", example = "18.00")
    private BigDecimal taxPercentage;

    @Schema(description = "Reading km", example = "12345.67")
    private BigDecimal readingKm;

    @Schema(description = "Fuel density", example = "0.850")
    private BigDecimal density;

    @Schema(description = "DIP reading", example = "1500.50")
    private BigDecimal dipReading;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Version number", example = "1")
    private Long version;
}
