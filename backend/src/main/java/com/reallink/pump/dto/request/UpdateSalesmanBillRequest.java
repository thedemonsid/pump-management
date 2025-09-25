package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a salesman bill")
public class UpdateSalesmanBillRequest {

    @Schema(description = "Bill number", example = "1001")
    private Long billNo;

    @Schema(description = "Bill date", example = "2025-09-14")
    private LocalDate billDate;

    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Product ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID productId;

    @Schema(description = "Salesman Nozzle Shift ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID salesmanNozzleShiftId;

    @Schema(description = "Vehicle number", example = "MH12AB1234")
    private String vehicleNo;

    @Schema(description = "Driver name (received by person)", example = "John Doe")
    private String driverName;

    @Schema(description = "Rate type", example = "INCLUDING_GST")
    private RateType rateType;

    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Quantity must have at most 10 digits and 2 decimal places")
    @Schema(description = "Fuel quantity", example = "50.00")
    private BigDecimal quantity;

    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Rate must have at most 10 digits and 2 decimal places")
    @Schema(description = "Fuel rate per unit", example = "100.00")
    private BigDecimal rate;
}
