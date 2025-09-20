package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Customer Bill Payment information")
public class CustomerBillPaymentResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Bill ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID billId;

    @Schema(description = "Bill number", example = "1001")
    private Long billNo;

    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Customer name", example = "John Doe")
    private String customerName;

    @Schema(description = "Bank Account ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @Schema(description = "Bank account holder name", example = "Pump Station Account")
    private String bankAccountHolderName;

    @Schema(description = "Payment amount", example = "100.00")
    private BigDecimal amount;

    @Schema(description = "Payment date and time", example = "2025-09-15T10:00:00")
    private LocalDateTime paymentDate;

    @Schema(description = "Payment method", example = "CASH")
    private PaymentMethod paymentMethod;

    @Schema(description = "Payment reference number", example = "REF123456")
    private String referenceNumber;

    @Schema(description = "Additional notes", example = "Payment received via cash")
    private String notes;

    @Schema(description = "Creation timestamp", example = "2025-09-15T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2025-09-15T10:00:00")
    private LocalDateTime updatedAt;
}
