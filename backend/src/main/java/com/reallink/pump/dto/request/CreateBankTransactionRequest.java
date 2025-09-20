package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.BankTransaction.TransactionType;
import com.reallink.pump.entities.PaymentMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a bank transaction")
public class CreateBankTransactionRequest {

    @NotNull(message = "Bank Account ID is required")
    @Schema(description = "Bank Account ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    @Schema(description = "Transaction amount", example = "1000.00")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    @Enumerated(EnumType.STRING)
    @Schema(description = "Transaction type", example = "CREDIT")
    private TransactionType transactionType;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters")
    @Schema(description = "Transaction description", example = "Salary deposit")
    private String description;

    @NotNull(message = "Payment method is required")
    @Enumerated(EnumType.STRING)
    @Schema(description = "Payment method", example = "CASH")
    private PaymentMethod paymentMethod;

    @Schema(description = "Transaction date (optional, defaults to now)", example = "2023-10-01T12:00:00")
    private LocalDateTime transactionDate;
}
