package com.reallink.pump.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSalesmanShiftAccountingRequest {

    @NotNull(message = "UPI received is required")
    @DecimalMin(value = "0.0", message = "UPI received cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "UPI received must have at most 15 digits and 2 decimal places")
    private BigDecimal upiReceived;

    @NotNull(message = "Card received is required")
    @DecimalMin(value = "0.0", message = "Card received cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Card received must have at most 15 digits and 2 decimal places")
    private BigDecimal cardReceived;

    @NotNull(message = "Expenses is required")
    @DecimalMin(value = "0.0", message = "Expenses cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Expenses must have at most 15 digits and 2 decimal places")
    private BigDecimal expenses;

    private String expenseReason;

    @Min(value = 0, message = "Number of 2000 notes cannot be negative")
    private Integer notes2000 = 0;

    @Min(value = 0, message = "Number of 1000 notes cannot be negative")
    private Integer notes1000 = 0;

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
