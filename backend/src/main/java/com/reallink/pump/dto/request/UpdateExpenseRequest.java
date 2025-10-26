package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.reallink.pump.entities.Expense.ExpenseType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an expense")
public class UpdateExpenseRequest {

    @Schema(description = "Expense head ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID expenseHeadId;

    @Schema(description = "Type of expense (NOZZLE_SHIFT or BANK_ACCOUNT)", example = "BANK_ACCOUNT")
    private ExpenseType expenseType;

    @Schema(description = "Salesman nozzle shift ID (required if expenseType is NOZZLE_SHIFT)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanNozzleShiftId;

    @Schema(description = "Bank account ID (required if expenseType is BANK_ACCOUNT)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID bankAccountId;

    @Schema(description = "Date of the expense", example = "2024-01-15")
    private LocalDate expenseDate;

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Expense amount", example = "1500.50")
    private BigDecimal amount;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    @Schema(description = "Additional remarks or notes", example = "Payment for fuel purchase")
    private String remarks;

    @Size(max = 100, message = "Reference number cannot exceed 100 characters")
    @Schema(description = "Reference number (invoice, receipt, etc.)", example = "INV-2024-001")
    private String referenceNumber;
}
