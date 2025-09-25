package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Salesman Bill Payment information")
public class SalesmanBillPaymentResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Salesman Nozzle Shift ID", example = "123e4567-e29b-41d4-a716-446655440000")
    private UUID salesmanNozzleShiftId;

    @Schema(description = "Salesman Name", example = "Rajesh Kumar")
    private String salesmanName;

    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Customer Name", example = "ABC Transport")
    private String customerName;

    @Schema(description = "Bank Account ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @Schema(description = "Bank Account Name", example = "Main Cash Account")
    private String bankAccountName;

    @Schema(description = "Payment amount", example = "5000.00")
    private BigDecimal amount;

    @Schema(description = "Payment date and time", example = "2025-09-25T14:30:00")
    private LocalDateTime paymentDate;

    @Schema(description = "Payment method used", example = "CASH")
    private PaymentMethod paymentMethod;

    @Schema(description = "Payment reference number", example = "PAY-001")
    private String referenceNumber;

    @Schema(description = "Additional notes", example = "Payment collected by salesman during shift")
    private String notes;

    @Schema(description = "Bank Transaction ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankTransactionId;

    @Schema(description = "Creation timestamp", example = "2025-09-25T14:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2025-09-25T14:30:00")
    private LocalDateTime updatedAt;
}
