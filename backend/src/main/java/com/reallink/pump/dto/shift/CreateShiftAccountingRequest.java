package com.reallink.pump.dto.shift;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating shift accounting.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateShiftAccountingRequest {

    @DecimalMin(value = "0.0", message = "UPI received cannot be negative")
    @Digits(integer = 15, fraction = 2)
    private BigDecimal upiReceived = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Card received cannot be negative")
    @Digits(integer = 15, fraction = 2)
    private BigDecimal cardReceived = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Fleet card received cannot be negative")
    @Digits(integer = 15, fraction = 2)
    private BigDecimal fleetCardReceived = BigDecimal.ZERO;

    // Cash denomination counts
    @Min(value = 0, message = "Number of 500 notes cannot be negative")
    private Integer notes500 = 0;

    @Min(value = 0, message = "Number of 200 notes cannot be negative")
    private Integer notes200 = 0;

    @Min(value = 0, message = "Number of 100 notes cannot be negative")
    private Integer notes100 = 0;

    @Min(value = 0, message = "Number of 50 notes cannot be negative")
    private Integer notes50 = 0;

    @Min(value = 0, message = "Number of 20 notes cannot be negative")
    private Integer notes20 = 0;

    @Min(value = 0, message = "Number of 10 notes cannot be negative")
    private Integer notes10 = 0;

    @Min(value = 0, message = "Number of 5 coins cannot be negative")
    private Integer coins5 = 0;

    @Min(value = 0, message = "Number of 2 coins cannot be negative")
    private Integer coins2 = 0;

    @Min(value = 0, message = "Number of 1 coins cannot be negative")
    private Integer coins1 = 0;
}
