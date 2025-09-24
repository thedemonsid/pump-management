package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Salesman Nozzle Shift information")
public class SalesmanNozzleShiftResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Salesman ID", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID salesmanId;

    @Schema(description = "Salesman username", example = "john_doe")
    private String salesmanUsername;

    @Schema(description = "Nozzle ID", example = "123e4567-e89b-12d3-a456-426614174002")
    private UUID nozzleId;

    @Schema(description = "Nozzle name", example = "Nozzle 1")
    private String nozzleName;

    @Schema(description = "Nozzle company name", example = "Company XYZ")
    private String nozzleCompanyName;

    @Schema(description = "Nozzle location", example = "Pump Station A")
    private String nozzleLocation;

    @Schema(description = "Nozzle status", example = "ACTIVE")
    private String nozzleStatus;

    @Schema(description = "Tank ID", example = "123e4567-e89b-12d3-a456-426614174003")
    private UUID tankId;

    @Schema(description = "Tank name", example = "Tank 1")
    private String tankName;

    @Schema(description = "Product name", example = "Petrol")
    private String productName;

    @Schema(description = "Start date and time of the shift", example = "2023-10-01T08:00:00")
    private LocalDateTime startDateTime;

    @Schema(description = "End date and time of the shift", example = "2023-10-01T17:00:00")
    private LocalDateTime endDateTime;

    @Schema(description = "Opening balance at start of shift", example = "1000.000")
    private BigDecimal openingBalance;

    @Schema(description = "Closing balance at end of shift", example = "1500.500")
    private BigDecimal closingBalance;

    @Schema(description = "Product price during the shift", example = "95.50")
    private BigDecimal productPrice;

    @Schema(description = "Total amount in rupees ((closing - opening) * productPrice)", example = "47500.00")
    private BigDecimal totalAmount;

    @Schema(description = "Status of the shift", example = "OPEN", allowableValues = {"OPEN", "CLOSED"})
    private String status;

    @Schema(description = "Dispensed amount during the shift", example = "500.500")
    private BigDecimal dispensedAmount;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Version number", example = "1")
    private Long version;
}
