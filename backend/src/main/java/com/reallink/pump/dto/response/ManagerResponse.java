package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Manager information")
public class ManagerResponse {

    @Schema(description = "Unique identifier of the manager")
    private UUID id;

    @Schema(description = "Username of the manager")
    private String username;

    @Schema(description = "Mobile number")
    private String mobileNumber;

    @Schema(description = "Email address")
    private String email;

    @Schema(description = "Aadhar card number")
    private String aadharNumber;

    @Schema(description = "PAN card number")
    private String panNumber;

    @Schema(description = "Whether the manager is enabled")
    private Boolean enabled;

    @Schema(description = "Opening balance for the manager")
    private BigDecimal openingBalance;

    @Schema(description = "Opening balance date")
    private LocalDate openingBalanceDate;

    @Schema(description = "ID of the pump master")
    private UUID pumpMasterId;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Version for optimistic locking")
    private Long version;
}
