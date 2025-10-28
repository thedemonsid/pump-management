package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new salesman bill")
public class CreateSalesmanBillRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this bill belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Bill number is required")
    @Schema(description = "Bill number", example = "1001", required = true)
    private Long billNo;

    @NotNull(message = "Bill date is required")
    @Schema(description = "Bill date", example = "2025-09-14", required = true)
    private LocalDate billDate;

    @NotNull(message = "Customer ID is required")
    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID customerId;

    @NotNull(message = "Product ID is required")
    @Schema(description = "Product ID (must be FUEL type)", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID productId;

    @NotNull(message = "Salesman Shift ID is required")
    @Schema(description = "Salesman Shift ID during which bill was created", example = "123e4567-e29b-41d4-a716-446655440000", required = true)
    private UUID salesmanShiftId;

    @NotBlank(message = "Vehicle number is required")
    @Size(max = 20, message = "Vehicle number cannot exceed 20 characters")
    @Schema(description = "Vehicle number", example = "MH12AB1234", required = true)
    private String vehicleNo;

    @NotBlank(message = "Driver name is required")
    @Size(max = 100, message = "Driver name cannot exceed 100 characters")
    @Schema(description = "Driver name (received by person)", example = "John Doe", required = true)
    private String driverName;

    @NotNull(message = "Rate type is required")
    @Schema(description = "Rate type", example = "INCLUDING_GST", required = true)
    private RateType rateType;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Quantity must have at most 10 digits and 2 decimal places")
    @Schema(description = "Fuel quantity", example = "50.00", required = true)
    private BigDecimal quantity;

    @NotNull(message = "Rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Rate must have at most 10 digits and 2 decimal places")
    @Schema(description = "Fuel rate per unit", example = "100.00", required = true)
    private BigDecimal rate;

    @Schema(description = "Meter image ID (optional)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID meterImageId;

    @Schema(description = "Vehicle image ID (optional)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID vehicleImageId;

    @Schema(description = "Extra image ID (optional)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID extraImageId;
}
