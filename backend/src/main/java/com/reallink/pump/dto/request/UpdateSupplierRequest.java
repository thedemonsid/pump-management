package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing supplier")
public class UpdateSupplierRequest {

    @Schema(description = "Pump Master ID this supplier belongs to", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Size(min = 2, max = 100, message = "Supplier name must be between 2 and 100 characters")
    @Schema(description = "Supplier name", example = "ABC Fuels Ltd")
    private String supplierName;

    @Size(min = 2, max = 100, message = "Contact person name must be between 2 and 100 characters")
    @Schema(description = "Contact person name", example = "John Doe")
    private String contactPersonName;

    @Size(min = 10, max = 15, message = "Contact number must be between 10 and 15 characters")
    @Schema(description = "Contact number", example = "9876543210")
    private String contactNumber;

    @Size(max = 200, message = "Email cannot exceed 200 characters")
    @Schema(description = "Email address", example = "john.doe@abc.com")
    private String email;

    @Size(min = 15, max = 15, message = "GST Number must be exactly 15 characters")
    @Schema(description = "GST Identification Number", example = "22AAAAA0000A1Z5")
    private String gstNumber;

    @Size(min = 11, max = 11, message = "Tax Identification Number must be exactly 11 characters")
    @Schema(description = "Tax Identification Number", example = "12345678901")
    private String taxIdentificationNumber;

    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    @Schema(description = "Supplier address", example = "123 Main Street, City, State, PIN 123456")
    private String address;

    @DecimalMin(value = "0.00", message = "Opening balance must be greater than or equal to 0.00")
    @Schema(description = "Opening Balance", example = "50000.00")
    private BigDecimal openingBalance;

    @Schema(description = "Opening Balance Date", example = "2023-01-01")
    private LocalDate openingBalanceDate;
}
