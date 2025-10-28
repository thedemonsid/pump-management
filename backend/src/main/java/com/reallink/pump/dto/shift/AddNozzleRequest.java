package com.reallink.pump.dto.shift;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for adding a nozzle to a shift.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddNozzleRequest {

    @NotNull(message = "Nozzle ID is required")
    private java.util.UUID nozzleId;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.0", message = "Opening balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening balance must have at most 12 digits and 3 decimal places")
    private BigDecimal openingBalance;
}
