package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateFuelPurchaseRequest;
import com.reallink.pump.dto.request.UpdateFuelPurchaseRequest;
import com.reallink.pump.dto.response.FuelPurchaseResponse;
import com.reallink.pump.entities.FuelPurchase;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface FuelPurchaseMapper {

    /**
     * Maps CreateFuelPurchaseRequest to FuelPurchase entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    @Mapping(target = "supplier.id", source = "supplierId")
    @Mapping(target = "tank.id", source = "tankId")
    FuelPurchase toEntity(CreateFuelPurchaseRequest request);

    /**
     * Maps FuelPurchase entity to FuelPurchaseResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.supplierName")
    @Mapping(target = "tankId", source = "tank.id")
    @Mapping(target = "tankName", source = "tank.tankName")
    @Mapping(target = "productId", source = "tank.product.id")
    @Mapping(target = "productName", source = "tank.product.productName")
    FuelPurchaseResponse toResponse(FuelPurchase entity);

    /**
     * Maps list of FuelPurchase entities to list of FuelPurchaseResponse
     */
    List<FuelPurchaseResponse> toResponseList(List<FuelPurchase> entities);

    /**
     * Updates FuelPurchase entity from UpdateFuelPurchaseRequest
     */
    @Mapping(target = "supplier.id", source = "supplierId")
    @Mapping(target = "tank.id", source = "tankId")
    void updateEntityFromRequest(UpdateFuelPurchaseRequest request, @MappingTarget FuelPurchase entity);
}
