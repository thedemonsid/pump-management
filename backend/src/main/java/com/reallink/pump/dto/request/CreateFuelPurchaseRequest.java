package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new fuel purchase")
public class CreateFuelPurchaseRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this fuel purchase belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Purchase date is required")
    @Schema(description = "Purchase date", example = "2023-10-01")
    private LocalDate purchaseDate;

    @NotNull(message = "Supplier ID is required")
    @Schema(description = "Supplier ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID supplierId;

    @NotBlank(message = "Invoice number is required")
    @Size(max = 50, message = "Invoice number cannot exceed 50 characters")
    @Schema(description = "Invoice number", example = "INV001")
    private String invoiceNumber;

    @Schema(description = "Add to stock", example = "true")
    private Boolean addToStock = false;

    @NotNull(message = "Tank ID is required")
    @Schema(description = "Tank ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID tankId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Quantity must have at most 10 digits and 2 decimal places")
    @Schema(description = "Quantity", example = "100.00")
    private BigDecimal quantity;

    @NotNull(message = "Purchase rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Purchase rate must have at most 10 digits and 2 decimal places")
    @Schema(description = "Purchase rate", example = "50.00")
    private BigDecimal purchaseRate;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be positive")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Amount", example = "5000.00")
    private BigDecimal amount;

    @Size(max = 100, message = "Vehicle number cannot exceed 100 characters")
    @Schema(description = "Vehicle number", example = "Truck ABC-1234")
    private String vehicleNumber;

    @Size(max = 45, message = "Driver name cannot exceed 45 characters")
    @Schema(description = "Driver name", example = "John Smith")
    private String driverName;

    @Size(max = 100, message = "Goods received by cannot exceed 100 characters")
    @Schema(description = "Goods received by", example = "John Doe")
    private String goodsReceivedBy;

    @NotBlank(message = "Purchase unit is required")
    @Size(max = 20, message = "Purchase unit cannot exceed 20 characters")
    @Schema(description = "Purchase unit", example = "Liters")
    private String purchaseUnit;

    @NotNull(message = "Tax percentage is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tax percentage must be non-negative")
    @Digits(integer = 5, fraction = 2, message = "Tax percentage must have at most 5 digits and 2 decimal places")
    @Schema(description = "Tax percentage", example = "18.00")
    private BigDecimal taxPercentage;

    @DecimalMin(value = "0.0", inclusive = true, message = "Reading km must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Reading km must have at most 10 digits and 2 decimal places")
    @Schema(description = "Reading km", example = "12345.67")
    private BigDecimal readingKm;

    @NotNull(message = "Before density is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Before density must be positive")
    @Digits(integer = 5, fraction = 3, message = "Before density must have at most 5 digits and 3 decimal places")
    @Schema(description = "Before fuel density", example = "0.850")
    private BigDecimal bfrDensity;

    @NotNull(message = "After density is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "After density must be positive")
    @Digits(integer = 5, fraction = 3, message = "After density must have at most 5 digits and 3 decimal places")
    @Schema(description = "After fuel density", example = "0.852")
    private BigDecimal aftDensity;

    @NotNull(message = "Before DIP reading is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Before DIP reading must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Before DIP reading must have at most 10 digits and 2 decimal places")
    @Schema(description = "Before DIP reading", example = "1500.50")
    private BigDecimal bfrDipReading;

    @NotNull(message = "After DIP reading is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "After DIP reading must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "After DIP reading must have at most 10 digits and 2 decimal places")
    @Schema(description = "After DIP reading", example = "1600.75")
    private BigDecimal aftDipReading;
}
