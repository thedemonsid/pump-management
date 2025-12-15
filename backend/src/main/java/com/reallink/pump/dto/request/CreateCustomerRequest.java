package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new customer")
public class CreateCustomerRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this product belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

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

    @Schema(description = "GST Identification Number", example = "22AAAAA0000A1Z5")
    private String gstNumber;

    @Schema(description = "PAN Number", example = "ABCDE1234F")
    private String panNumber;

    @NotNull(message = "Credit limit is required")
    @Min(value = 0, message = "Credit limit cannot be negative")
    @Schema(description = "Credit Limit", example = "50000")
    private Double creditLimit;

    @NotNull(message = "Opening balance is required")
    @Schema(description = "Opening Balance", example = "10000.00")
    private BigDecimal openingBalance;

    @NotNull(message = "Opening balance date is required")
    @Schema(description = "Opening Balance Date", example = "2023-01-01")
    private LocalDate openingBalanceDate;

}
