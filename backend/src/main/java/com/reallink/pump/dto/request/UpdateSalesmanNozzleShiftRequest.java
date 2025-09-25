package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.SalesmanNozzleShift.ShiftStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a salesman nozzle shift by admin")
public class UpdateSalesmanNozzleShiftRequest {

    @Schema(description = "ID of the salesman", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanId;

    @Schema(description = "ID of the nozzle", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID nozzleId;

    @Schema(description = "Start date and time of the shift")
    private LocalDateTime startDateTime;

    @Schema(description = "End date and time of the shift")
    private LocalDateTime endDateTime;

    @DecimalMin(value = "0.0", message = "Opening balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening balance must have at most 12 digits and 3 decimal places")
    @Schema(description = "Opening balance", example = "1000.000")
    private BigDecimal openingBalance;

    @DecimalMin(value = "0.0", message = "Closing balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing balance must have at most 12 digits and 3 decimal places")
    @Schema(description = "Closing balance", example = "1500.500")
    private BigDecimal closingBalance;

    @DecimalMin(value = "0.0", inclusive = false, message = "Product price must be positive")
    @Digits(integer = 10, fraction = 2, message = "Product price must have at most 10 digits and 2 decimal places")
    @Schema(description = "Product price", example = "2.50")
    private BigDecimal productPrice;

    @Schema(description = "Status of the shift")
    private ShiftStatus status;
}
