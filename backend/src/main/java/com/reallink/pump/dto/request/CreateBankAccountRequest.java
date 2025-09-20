package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new bank account")
public class CreateBankAccountRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this bank account belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotBlank(message = "Account holder name is required")
    @Size(min = 2, max = 100, message = "Account holder name must be between 2 and 100 characters")
    @Schema(description = "Account holder name", example = "John Doe")
    private String accountHolderName;

    @NotBlank(message = "Account number is required")
    @Size(min = 10, max = 20, message = "Account number must be between 10 and 20 characters")
    @Schema(description = "Bank account number", example = "123456789012")
    private String accountNumber;

    @NotBlank(message = "IFSC code is required")
    @Size(min = 11, max = 11, message = "IFSC code must be exactly 11 characters")
    @Schema(description = "IFSC code", example = "SBIN0001234")
    private String ifscCode;

    @NotBlank(message = "Bank name is required")
    @Size(min = 2, max = 100, message = "Bank name must be between 2 and 100 characters")
    @Schema(description = "Bank name", example = "State Bank of India")
    private String bank;

    @NotBlank(message = "Branch is required")
    @Size(min = 2, max = 100, message = "Branch must be between 2 and 100 characters")
    @Schema(description = "Branch name", example = "Main Branch")
    private String branch;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.00", message = "Opening balance must be greater than or equal to 0.00")
    @Schema(description = "Opening balance", example = "10000.00")
    private BigDecimal openingBalance;

    @NotNull(message = "Opening balance date is required")
    @Schema(description = "Opening balance date", example = "2023-01-01")
    private LocalDate openingBalanceDate;
}
