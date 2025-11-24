package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.reallink.pump.entities.PaymentMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Nested DTO for cash payment details when creating a bill with CASH payment type")
public class CashPaymentRequest {

    @NotNull(message = "Payment amount is required for cash payment")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than 0.00")
    @Schema(description = "Payment amount", example = "5000.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal amount;

    @NotNull(message = "Payment date is required for cash payment")
    @Schema(description = "Payment date and time", example = "2025-09-25T14:30:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime paymentDate;

    @NotNull(message = "Payment method is required for cash payment")
    @Schema(description = "Payment method used", example = "CASH", requiredMode = Schema.RequiredMode.REQUIRED)
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Reference number is required for cash payment")
    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    @Schema(description = "Payment reference number", example = "PAY-001", requiredMode = Schema.RequiredMode.REQUIRED)
    private String referenceNumber;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    @Schema(description = "Additional notes", example = "Cash payment collected with bill")
    private String notes;
}
