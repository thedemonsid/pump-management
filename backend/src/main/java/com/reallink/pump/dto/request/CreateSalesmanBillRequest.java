package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new salesman bill")
public class CreateSalesmanBillRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this bill belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Bill number is required")
    @Min(value = 1, message = "Bill number must be positive")
    @Schema(description = "Bill number", example = "1001", required = true)
    private Long billNo;

    @NotNull(message = "Bill date is required")
    @Schema(description = "Bill date", example = "2025-09-14", required = true)
    private LocalDate billDate;

    @NotNull(message = "Customer ID is required")
    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID customerId;

    @Schema(description = "Salesman ID (optional)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanId;

    @NotNull(message = "Net amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Net amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Net amount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Net amount", example = "354.00", required = true)
    private BigDecimal netAmount;
}
