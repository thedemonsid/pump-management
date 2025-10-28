package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for Salesman Shift Accounting information")
public class SalesmanShiftAccountingResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Salesman Nozzle Shift ID", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID shiftId;

    @Schema(description = "Fuel sales amount", example = "47500.00")
    private BigDecimal fuelSales;

    @Schema(description = "Customer receipt (cash from customers)", example = "2500.00")
    private BigDecimal customerReceipt;

    @Schema(description = "System received amount (fuel sales + customer receipt)", example = "50000.00")
    private BigDecimal systemReceivedAmount;

    @Schema(description = "UPI received amount", example = "10000.00")
    private BigDecimal upiReceived;

    @Schema(description = "Card received amount", example = "15000.00")
    private BigDecimal cardReceived;

    @Schema(description = "Fleet card received amount", example = "8000.00")
    private BigDecimal fleetCardReceived;

    @Schema(description = "Credit amount", example = "5000.00")
    private BigDecimal credit;

    @Schema(description = "Total expenses from shift expenses", example = "500.00")
    private BigDecimal expenses;

    @Schema(description = "Opening cash given to salesman at shift start", example = "5000.00")
    private BigDecimal openingCash;

    @Schema(description = "Cash in hand", example = "20000.00")
    private BigDecimal cashInHand;

    @Schema(description = "Balance amount (expected cash - actual cash)", example = "0.00")
    private BigDecimal balanceAmount;

    @Schema(description = "Number of 500 rupees notes", example = "20")
    private Integer notes500;

    @Schema(description = "Number of 200 rupees notes", example = "25")
    private Integer notes200;

    @Schema(description = "Number of 100 rupees notes", example = "50")
    private Integer notes100;

    @Schema(description = "Number of 50 rupees notes", example = "100")
    private Integer notes50;

    @Schema(description = "Number of 20 rupees notes", example = "250")
    private Integer notes20;

    @Schema(description = "Number of 10 rupees notes", example = "500")
    private Integer notes10;

    @Schema(description = "Number of 5 rupees coins", example = "1000")
    private Integer coins5;

    @Schema(description = "Number of 2 rupees coins", example = "2500")
    private Integer coins2;

    @Schema(description = "Number of 1 rupee coins", example = "5000")
    private Integer coins1;

    @Schema(description = "Creation timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2023-10-01T12:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Version number", example = "1")
    private Long version;
}
