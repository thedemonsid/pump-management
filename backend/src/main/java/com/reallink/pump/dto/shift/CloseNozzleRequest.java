package com.reallink.pump.dto.shift;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for closing a nozzle assignment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CloseNozzleRequest {

    @NotNull(message = "Closing balance is required")
    @DecimalMin(value = "0.0", message = "Closing balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing balance must have at most 12 digits and 3 decimal places")
    private BigDecimal closingBalance;

    /**
     * Optional end time for the nozzle assignment. If not provided, defaults to
     * current time. Only ADMIN and MANAGER roles can set custom end time.
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
}
