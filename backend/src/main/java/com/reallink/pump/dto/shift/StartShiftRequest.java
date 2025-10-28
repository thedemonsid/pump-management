package com.reallink.pump.dto.shift;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for starting a new salesman shift.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartShiftRequest {

    @NotNull(message = "Salesman ID is required")
    private java.util.UUID salesmanId;

    @DecimalMin(value = "0.0", message = "Opening cash cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Opening cash must have at most 15 digits and 2 decimal places")
    private BigDecimal openingCash = BigDecimal.ZERO;
}
