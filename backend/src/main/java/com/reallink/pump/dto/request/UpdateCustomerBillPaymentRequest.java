package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a customer bill payment")
public class UpdateCustomerBillPaymentRequest {

    @Schema(description = "Pump Master ID this payment belongs to", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Bill ID this payment is for (optional - for general customer payments)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID billId;

    @Schema(description = "Customer ID making the payment", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Bank Account ID where payment is deposited", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    @Schema(description = "Payment amount", example = "100.00")
    private BigDecimal amount;

    @Schema(description = "Payment date and time", example = "2025-09-15T10:00:00")
    private LocalDateTime paymentDate;

    @Schema(description = "Payment method", example = "CASH")
    private PaymentMethod paymentMethod;

    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    @Schema(description = "Payment reference number", example = "REF123456")
    private String referenceNumber;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    @Schema(description = "Additional notes", example = "Payment received via cash")
    private String notes;
}
