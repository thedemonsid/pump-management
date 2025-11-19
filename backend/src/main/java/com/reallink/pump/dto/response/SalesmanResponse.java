package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Salesman information")
public class SalesmanResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Username for login", example = "john_doe")
    private String username;

    @Schema(description = "Mobile number", example = "+919876543210")
    private String mobileNumber;

    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Aadhar card number", example = "123456789012")
    private String aadharNumber;

    @Schema(description = "PAN card number", example = "ABCDE1234F")
    private String panNumber;

    @Schema(description = "Whether the salesman is enabled", example = "true")
    private Boolean enabled;

    @Schema(description = "Opening balance for the salesman", example = "0.00")
    private BigDecimal openingBalance;

    @Schema(description = "Opening balance date", example = "2023-01-01")
    private LocalDate openingBalanceDate;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Version number", example = "1")
    private Long version;
}
