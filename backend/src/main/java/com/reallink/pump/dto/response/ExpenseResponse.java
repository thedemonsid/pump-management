package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.Expense.ExpenseType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Expense information")
public class ExpenseResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Expense head ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID expenseHeadId;

    @Schema(description = "Expense head name", example = "Fuel Purchase")
    private String expenseHeadName;

    @Schema(description = "Type of expense", example = "BANK_ACCOUNT")
    private ExpenseType expenseType;

    @Schema(description = "Salesman shift ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanShiftId;

    @Schema(description = "Bank account ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @Schema(description = "Bank account number", example = "123456789012")
    private String bankAccountNumber;

    @Schema(description = "Date of the expense", example = "2024-01-15")
    private LocalDate expenseDate;

    @Schema(description = "Expense amount", example = "1500.50")
    private BigDecimal amount;

    @Schema(description = "Additional remarks or notes", example = "Payment for fuel purchase")
    private String remarks;

    @Schema(description = "Reference number (invoice, receipt, etc.)", example = "INV-2024-001")
    private String referenceNumber;

    @Schema(description = "File storage ID for attached image/receipt", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID fileStorageId;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "User who created the record", example = "admin")
    private String entryBy;
}
