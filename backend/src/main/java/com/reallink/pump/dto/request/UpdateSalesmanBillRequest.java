package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a salesman bill")
public class UpdateSalesmanBillRequest {

    @Min(value = 1, message = "Bill number must be positive")
    @Schema(description = "Bill number", example = "1001")
    private Long billNo;

    @Schema(description = "Bill date", example = "2025-09-14")
    private LocalDate billDate;

    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Salesman ID (optional)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanId;

    @DecimalMin(value = "0.0", inclusive = true, message = "Net amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Net amount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Net amount", example = "354.00")
    private BigDecimal netAmount;
}
