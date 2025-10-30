package com.reallink.pump.mapper;

import org.springframework.stereotype.Component;

import com.reallink.pump.dto.response.ProductSalesUnitChangeLogResponse;
import com.reallink.pump.entities.ProductSalesUnitChangeLog;

@Component
public class ProductSalesUnitChangeLogMapper {

    public ProductSalesUnitChangeLogResponse toResponse(ProductSalesUnitChangeLog entity) {
        if (entity == null) {
            return null;
        }

        return ProductSalesUnitChangeLogResponse.builder()
                .id(entity.getId())
                .pumpMasterId(entity.getPumpMaster() != null ? entity.getPumpMaster().getId() : null)
                .productId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                .productName(entity.getProductName())
                .productType(entity.getProductType())
                .oldSalesUnit(entity.getOldSalesUnit())
                .newSalesUnit(entity.getNewSalesUnit())
                .oldStockQuantity(entity.getOldStockQuantity())
                .newStockQuantity(entity.getNewStockQuantity())
                .oldSalesRate(entity.getOldSalesRate())
                .newSalesRate(entity.getNewSalesRate())
                .changeReason(entity.getChangeReason())
                .changedBy(entity.getChangedBy())
                .remarks(entity.getRemarks())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
