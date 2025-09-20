package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreatePurchaseRequest;
import com.reallink.pump.dto.request.UpdatePurchaseRequest;
import com.reallink.pump.dto.response.PurchaseResponse;
import com.reallink.pump.entities.Purchase;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PurchaseMapper {

    /**
     * Maps CreatePurchaseRequest to Purchase entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    @Mapping(target = "supplier.id", source = "supplierId")
    @Mapping(target = "product.id", source = "productId")
    Purchase toEntity(CreatePurchaseRequest request);

    /**
     * Maps Purchase entity to PurchaseResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.supplierName")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    PurchaseResponse toResponse(Purchase entity);

    /**
     * Maps list of Purchase entities to list of PurchaseResponse
     */
    List<PurchaseResponse> toResponseList(List<Purchase> entities);

    /**
     * Updates Purchase entity from UpdatePurchaseRequest
     */
    @Mapping(target = "supplier.id", source = "supplierId")
    @Mapping(target = "product.id", source = "productId")
    void updateEntityFromRequest(UpdatePurchaseRequest request, @MappingTarget Purchase entity);
}
