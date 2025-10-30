package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductSalesUnitChangeLogRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotBlank(message = "Old sales unit is required")
    @Size(max = 20, message = "Old sales unit cannot exceed 20 characters")
    private String oldSalesUnit;

    @NotBlank(message = "New sales unit is required")
    @Size(max = 20, message = "New sales unit cannot exceed 20 characters")
    private String newSalesUnit;

    private BigDecimal oldStockQuantity;
    private BigDecimal newStockQuantity;
    private BigDecimal oldSalesRate;
    private BigDecimal newSalesRate;

    @Size(max = 500, message = "Change reason cannot exceed 500 characters")
    private String changeReason;

    @Size(max = 100, message = "Changed by cannot exceed 100 characters")
    private String changedBy;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
    private String remarks;
}
