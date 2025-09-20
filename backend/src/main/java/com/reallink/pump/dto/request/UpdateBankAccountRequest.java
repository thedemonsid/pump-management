package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a bank account")
public class UpdateBankAccountRequest {

    @Size(min = 2, max = 100, message = "Account holder name must be between 2 and 100 characters")
    @Schema(description = "Account holder name", example = "John Doe")
    private String accountHolderName;

    @Size(min = 10, max = 20, message = "Account number must be between 10 and 20 characters")
    @Schema(description = "Bank account number", example = "123456789012")
    private String accountNumber;

    @Size(min = 11, max = 11, message = "IFSC code must be exactly 11 characters")
    @Schema(description = "IFSC code", example = "SBIN0001234")
    private String ifscCode;

    @Size(min = 2, max = 100, message = "Bank name must be between 2 and 100 characters")
    @Schema(description = "Bank name", example = "State Bank of India")
    private String bank;

    @Size(min = 2, max = 100, message = "Branch must be between 2 and 100 characters")
    @Schema(description = "Branch name", example = "Main Branch")
    private String branch;

    @DecimalMin(value = "0.00", message = "Opening balance must be greater than or equal to 0.00")
    @Schema(description = "Opening balance", example = "10000.00")
    private BigDecimal openingBalance;

    @Schema(description = "Opening balance date", example = "2023-01-01")
    private LocalDate openingBalanceDate;
}
