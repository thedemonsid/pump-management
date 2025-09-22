package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Bank Account information")
public class BankAccountResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Account holder name", example = "John Doe")
    private String accountHolderName;

    @Schema(description = "Bank account number", example = "123456789012")
    private String accountNumber;

    @Schema(description = "IFSC code", example = "SBIN0001234")
    private String ifscCode;

    @Schema(description = "Bank name", example = "State Bank of India")
    private String bank;

    @Schema(description = "Branch name", example = "Main Branch")
    private String branch;

    @Schema(description = "Opening balance", example = "10000.00")
    private BigDecimal openingBalance;

    @Schema(description = "Opening balance date", example = "2023-01-01")
    private LocalDate openingBalanceDate;

    @Schema(description = "Current balance (calculated from opening balance + transactions)", example = "15000.00")
    private BigDecimal currentBalance;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Entry by", example = "admin")
    private String entryBy;

    @Schema(description = "Version number", example = "1")
    private Long version;
}
