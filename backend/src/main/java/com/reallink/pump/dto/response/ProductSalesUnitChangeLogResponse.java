package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.ProductType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesUnitChangeLogResponse {

    private UUID id;
    private UUID pumpMasterId;
    private UUID productId;
    private String productName;
    private ProductType productType;
    private String oldSalesUnit;
    private String newSalesUnit;
    private BigDecimal oldStockQuantity;
    private BigDecimal newStockQuantity;
    private BigDecimal oldSalesRate;
    private BigDecimal newSalesRate;
    private String changeReason;
    private String changedBy;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
