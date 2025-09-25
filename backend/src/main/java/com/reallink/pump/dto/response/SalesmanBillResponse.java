package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Salesman Bill information")
public class SalesmanBillResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Bill number", example = "1001")
    private Long billNo;

    @Schema(description = "Bill date", example = "2025-09-14")
    private LocalDate billDate;

    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Customer name", example = "VISHAL")
    private String customerName;

    @Schema(description = "Product ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID productId;

    @Schema(description = "Product name", example = "Petrol")
    private String productName;

    @Schema(description = "Salesman Nozzle Shift ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanNozzleShiftId;

    @Schema(description = "Vehicle number", example = "MH12AB1234")
    private String vehicleNo;

    @Schema(description = "Driver name (received by person)", example = "John Doe")
    private String driverName;

    @Schema(description = "Rate type", example = "INCLUDING_GST")
    private RateType rateType;

    @Schema(description = "Fuel quantity", example = "50.00")
    private BigDecimal quantity;

    @Schema(description = "Fuel rate per unit", example = "100.00")
    private BigDecimal rate;

    @Schema(description = "Amount", example = "5000.00")
    private BigDecimal amount;

    @Schema(description = "Net amount", example = "5000.00")
    private BigDecimal netAmount;

    @Schema(description = "Creation timestamp", example = "2025-09-14T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2025-09-14T10:00:00")
    private LocalDateTime updatedAt;
}
