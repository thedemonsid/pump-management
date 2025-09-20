package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for supplier information")
public class SupplierResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Supplier name", example = "ABC Fuels Ltd")
    private String supplierName;

    @Schema(description = "Contact person name", example = "John Doe")
    private String contactPersonName;

    @Schema(description = "Contact number", example = "9876543210")
    private String contactNumber;

    @Schema(description = "Email address", example = "john.doe@abc.com")
    private String email;

    @Schema(description = "GST Identification Number", example = "22AAAAA0000A1Z5")
    private String gstNumber;

    @Schema(description = "Tax Identification Number", example = "12345678901")
    private String taxIdentificationNumber;

    @Schema(description = "Supplier address", example = "123 Main Street, City, State, PIN 123456")
    private String address;

    @Schema(description = "Opening Balance", example = "50000.00")
    private BigDecimal openingBalance;

    @Schema(description = "Opening Balance Date", example = "2023-01-01")
    private LocalDate openingBalanceDate;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Version number", example = "1")
    private Long version;
}
