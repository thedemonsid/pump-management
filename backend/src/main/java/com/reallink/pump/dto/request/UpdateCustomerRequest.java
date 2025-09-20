package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing customer")
public class UpdateCustomerRequest {

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    @Schema(description = "Customer name", example = "Rajesh Kumar")
    private String customerName;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    @Schema(description = "Customer address", example = "123 Main Street, City, State, PIN 123456")
    private String address;

    @NotBlank(message = "Pincode is required")
    @Size(min = 5, max = 10, message = "Pincode must be between 5 and 10 characters")
    @Schema(description = "Pincode", example = "123456")
    private String pincode;

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 characters")
    @Schema(description = "Phone number", example = "9876543210")
    private String phoneNumber;

    @NotBlank(message = "GST number is required")
    @Size(min = 10, max = 20, message = "GST number must be greater than 10 and less than 20 characters")
    @Schema(description = "GST Identification Number", example = "22AAAAA0000A1Z5")
    private String gstNumber;

    @NotBlank(message = "PAN number is required")
    @Size(min = 10, max = 20, message = "PAN number must be greater than 10 and less than 20 characters")
    @Schema(description = "PAN Number", example = "ABCDE1234F")
    private String panNumber;

    @NotNull(message = "Credit limit is required")
    @Min(value = 0, message = "Credit limit cannot be negative")
    @Schema(description = "Credit Limit", example = "50000")
    private Double creditLimit;

    @DecimalMin(value = "0.00", message = "Opening balance must be greater than or equal to 0.00")
    @Schema(description = "Opening Balance", example = "10000.00")
    private BigDecimal openingBalance;

    @Schema(description = "Opening Balance Date", example = "2023-01-01")
    private LocalDate openingBalanceDate;

}
