package com.reallink.pump.dto.shift;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a nozzle test entry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNozzleTestRequest {

    @NotNull(message = "Nozzle ID is required")
    private UUID nozzleId;

    @NotNull(message = "Test quantity is required")
    @DecimalMin(value = "0.0", message = "Test quantity cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Test quantity must have at most 12 digits and 3 decimal places")
    private BigDecimal testQuantity;

    @NotNull(message = "Test datetime is required")
    private LocalDateTime testDatetime;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;
}
