package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new salesman nozzle shift")
public class CreateSalesmanNozzleShiftRequest {

    @Schema(description = "ID of the salesman", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID salesmanId;

    @Schema(description = "ID of the nozzle", example = "123e4567-e89b-12d3-a456-426614174001", required = true)
    private UUID nozzleId;

    @DecimalMin(value = "0.0", message = "Opening balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening balance must have at most 12 digits and 3 decimal places")
    @Schema(description = "Opening balance noted by salesman when starting shift", example = "1000.000", required = true)
    private BigDecimal openingBalance;

    @Schema(description = "End date and time of the shift (optional, for immediate shift closure)")
    private LocalDateTime endDateTime;

    @DecimalMin(value = "0.0", message = "Closing balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing balance must have at most 12 digits and 3 decimal places")
    @Schema(description = "Closing balance noted by salesman when ending shift (optional)")
    private BigDecimal closingBalance;
}
