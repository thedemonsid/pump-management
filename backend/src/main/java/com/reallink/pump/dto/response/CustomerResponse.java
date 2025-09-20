package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Customer information")
public class CustomerResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Customer name", example = "Rajesh Kumar")
    private String customerName;

    @Schema(description = "Customer address", example = "123 Main Street, City, State, PIN 123456")
    private String address;

    @Schema(description = "Pincode", example = "123456")
    private String pincode;

    @Schema(description = "Phone number", example = "9876543210")
    private String phoneNumber;

    @Schema(description = "GST Identification Number", example = "22AAAAA0000A1Z5")
    private String gstNumber;

    @Schema(description = "PAN Number", example = "ABCDE1234F")
    private String panNumber;

    @Schema(description = "Credit Limit", example = "50000")
    private Double creditLimit;

    @Schema(description = "Opening Balance", example = "10000.00")
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
