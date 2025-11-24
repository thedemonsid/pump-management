package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new salesman bill payment")
public class CreateSalesmanBillPaymentRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this payment belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Salesman Shift ID is required")
    @Schema(description = "Salesman Shift ID during which payment was collected", example = "123e4567-e29b-41d4-a716-446655440000", required = true)
    private UUID salesmanShiftId;

    @NotNull(message = "Customer ID is required")
    @Schema(description = "Customer ID making the payment", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID customerId;

    @Schema(description = "Salesman Bill ID if this payment is linked to a specific bill", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanBillId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    @Schema(description = "Payment amount", example = "5000.00", required = true)
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    @Schema(description = "Payment date and time", example = "2025-09-25T14:30:00", required = true)
    private LocalDateTime paymentDate;

    @NotNull(message = "Payment method is required")
    @Schema(description = "Payment method used", example = "CASH", required = true)
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Reference number is required")
    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    @Schema(description = "Payment reference number", example = "PAY-001", required = true)
    private String referenceNumber;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    @Schema(description = "Additional notes", example = "Payment collected by salesman during shift")
    private String notes;
}
