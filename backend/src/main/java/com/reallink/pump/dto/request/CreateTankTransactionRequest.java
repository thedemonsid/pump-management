package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a tank transaction")
public class CreateTankTransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Amount must be positive")
    @Schema(description = "Transaction amount", example = "1000.00", required = true)
    private BigDecimal amount;

    @Schema(description = "Transaction date and time", example = "2023-12-01T10:30:00")
    private LocalDateTime transactionDate;

    @Size(max = 255, message = "Remarks cannot exceed 255 characters")
    @Schema(description = "Transaction remarks", example = "Fuel delivery from supplier")
    private String remarks;
}
