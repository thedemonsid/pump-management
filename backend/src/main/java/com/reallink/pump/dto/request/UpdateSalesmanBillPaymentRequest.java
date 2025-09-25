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
@Schema(description = "Request DTO for updating a salesman bill payment")
public class UpdateSalesmanBillPaymentRequest {

    @Schema(description = "Salesman Nozzle Shift ID during which payment was collected", example = "123e4567-e29b-41d4-a716-446655440000")
    private UUID salesmanNozzleShiftId;

    @Schema(description = "Customer ID making the payment", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Bank Account ID where cash is deposited", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    @Schema(description = "Payment amount", example = "5000.00")
    private BigDecimal amount;

    @Schema(description = "Payment date and time", example = "2025-09-25T14:30:00")
    private LocalDateTime paymentDate;

    @Schema(description = "Payment method used", example = "CASH")
    private PaymentMethod paymentMethod;

    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    @Schema(description = "Payment reference number", example = "PAY-001")
    private String referenceNumber;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    @Schema(description = "Additional notes", example = "Payment collected by salesman during shift")
    private String notes;
}
