package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a tank transaction")
public class CreateTankTransactionRequest {

    @NotNull(message = "Volume is required")
    @DecimalMin(value = "0.01", message = "Volume must be greater than 0.00")
    @Schema(description = "Transaction volume", example = "1000.00", required = true)
    private BigDecimal volume;

    @NotNull(message = "Description is required")
    @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters")
    @Schema(description = "Transaction description", example = "Fuel purchase from supplier", required = true)
    private String description;

    @Schema(description = "Transaction date and time", example = "2023-12-01T10:30:00")
    private LocalDateTime transactionDate;

    @Size(max = 100, message = "Supplier name cannot exceed 100 characters")
    @Schema(description = "Supplier name", example = "ABC Fuel Suppliers")
    private String supplierName;

    @Size(max = 50, message = "Invoice number cannot exceed 50 characters")
    @Schema(description = "Invoice number", example = "INV-2023-001")
    private String invoiceNumber;
}
