package com.reallink.pump.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.reallink.pump.entities.BillType;
import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new bill")
public class CreateBillRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this bill belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotNull(message = "Bill number is required")
    @Schema(description = "Bill number", example = "1001", required = true)
    private Long billNo;

    @NotNull(message = "Bill date is required")
    @Schema(description = "Bill date", example = "2025-09-14", required = true)
    private LocalDate billDate;

    @NotNull(message = "Customer ID is required")
    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID customerId;

    @NotNull(message = "Bill type is required")
    @Schema(description = "Bill type", example = "GENERAL", required = true)
    private BillType billType;

    @Schema(description = "Vehicle number (required for SALESMAN bill type)", example = "MH12AB1234")
    private String vehicleNo;

    @Schema(description = "Driver name (required for SALESMAN bill type)", example = "John Doe")
    private String driverName;

    @NotNull(message = "Rate type is required")
    @Schema(description = "Rate type", example = "INCLUDING_GST", required = true)
    private RateType rateType;

    @NotEmpty(message = "Bill items are required")
    @Valid
    @Schema(description = "List of bill items", required = true)
    private List<CreateBillItemRequest> billItems;

    @Valid
    @Schema(description = "List of payments made during bill creation (optional)")
    private List<CreateCustomerBillPaymentRequest> payments;
}
