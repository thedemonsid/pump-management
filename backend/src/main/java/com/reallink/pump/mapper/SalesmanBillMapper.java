package com.reallink.pump.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateSalesmanBillRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillRequest;
import com.reallink.pump.dto.response.SalesmanBillResponse;
import com.reallink.pump.entities.SalesmanBill;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SalesmanBillMapper {

    /**
     * Maps CreateSalesmanBillRequest to SalesmanBill entity
     */
    // Do not map relations by id here; service will set managed entities to avoid detached instances
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "product", ignore = true)
    SalesmanBill toEntity(CreateSalesmanBillRequest request);

    /**
     * Maps SalesmanBill entity to SalesmanBillResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    SalesmanBillResponse toResponse(SalesmanBill entity);

    /**
     * Updates SalesmanBill entity from UpdateSalesmanBillRequest
     */
    // Do not map customer relation here; service handles setting a managed Customer when needed
    @Mapping(target = "product", ignore = true)
    SalesmanBill updateEntityFromRequest(UpdateSalesmanBillRequest request, @MappingTarget SalesmanBill entity);
}
