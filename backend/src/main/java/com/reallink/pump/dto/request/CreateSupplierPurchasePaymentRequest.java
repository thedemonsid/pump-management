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
@Schema(description = "Request DTO for creating a new supplier purchase payment")
public class CreateSupplierPurchasePaymentRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this payment belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @Schema(description = "Purchase ID this payment is for (optional - for general supplier payments)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID purchaseId;

    @NotNull(message = "Supplier ID is required")
    @Schema(description = "Supplier ID receiving the payment", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID supplierId;

    @NotNull(message = "Bank Account ID is required")
    @Schema(description = "Bank Account ID from where payment is made", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID bankAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    @Schema(description = "Payment amount", example = "100.00", required = true)
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    @Schema(description = "Payment date and time", example = "2025-09-15T10:00:00", required = true)
    private LocalDateTime paymentDate;

    @NotNull(message = "Payment method is required")
    @Schema(description = "Payment method (CASH, UPI, CHEQUE, RTGS, NEFT, IMPS)", example = "CASH", required = true)
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Reference number is required")
    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    @Schema(description = "Payment reference number", example = "REF123456", required = true)
    private String referenceNumber;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    @Schema(description = "Additional notes", example = "Payment made via UPI")
    private String notes;
}
