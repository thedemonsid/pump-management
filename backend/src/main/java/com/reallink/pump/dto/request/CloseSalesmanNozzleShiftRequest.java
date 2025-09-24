package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for closing a salesman nozzle shift")
public class CloseSalesmanNozzleShiftRequest {

    @NotNull(message = "Closing balance is required")
    @DecimalMin(value = "0.0", message = "Closing balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing balance must have at most 12 digits and 3 decimal places")
    @Schema(description = "Closing balance noted by salesman when ending shift", example = "1500.500", required = true)
    private BigDecimal closingBalance;

    @Schema(description = "ID of the next salesman to assign this nozzle to (optional). If provided, a new shift will be created for this salesman with opening balance auto-populated from the closing balance", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID nextSalesmanId;
}
