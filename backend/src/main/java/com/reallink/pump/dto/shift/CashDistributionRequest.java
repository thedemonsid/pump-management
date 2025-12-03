package com.reallink.pump.dto.shift;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for distributing cash from shift accounting to bank accounts.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashDistributionRequest {

    @NotEmpty(message = "At least one distribution is required")
    @Valid
    private List<DistributionItem> distributions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DistributionItem {

        @NotNull(message = "Bank account ID is required")
        private UUID bankAccountId;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        @Digits(integer = 15, fraction = 2, message = "Amount must have at most 15 digits and 2 decimal places")
        private BigDecimal amount;
    }
}
