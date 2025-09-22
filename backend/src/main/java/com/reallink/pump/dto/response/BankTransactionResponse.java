package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.BankTransaction.TransactionType;
import com.reallink.pump.entities.PaymentMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Bank Transaction information")
public class BankTransactionResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Bank Account ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @Schema(description = "Transaction amount", example = "1000.00")
    private BigDecimal amount;

    @Schema(description = "Transaction type", example = "CREDIT")
    private TransactionType transactionType;

    @Schema(description = "Transaction description", example = "Salary deposit")
    private String description;

    @Schema(description = "Transaction date", example = "2023-10-01T12:00:00")
    private LocalDateTime transactionDate;

    @Schema(description = "Payment method", example = "CASH")
    private PaymentMethod paymentMethod;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Entry by", example = "admin")
    private String entryBy;
}
