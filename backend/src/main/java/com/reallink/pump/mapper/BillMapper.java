package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateBillItemRequest;
import com.reallink.pump.dto.request.CreateBillRequest;
import com.reallink.pump.dto.request.UpdateBillRequest;
import com.reallink.pump.dto.response.BillItemResponse;
import com.reallink.pump.dto.response.BillResponse;
import com.reallink.pump.entities.Bill;
import com.reallink.pump.entities.BillItem;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BillMapper {

    /**
     * Maps CreateBillRequest to Bill entity
     */
    // Do not map relations by id here; service will set managed entities to avoid detached instances
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "billItems", ignore = true)
    Bill toEntity(CreateBillRequest request);

    /**
     * Maps CreateBillItemRequest to BillItem entity
     */
    // Do not create a detached Product instance here; service will set the managed Product
    @Mapping(target = "product", ignore = true)
    BillItem toEntity(CreateBillItemRequest request);

    /**
     * Maps Bill entity to BillResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "billItems", source = "billItems")
    @Mapping(target = "payments", source = "customerBillPayments")
    BillResponse toResponse(Bill entity);

    /**
     * Maps BillItem entity to BillItemResponse
     */
    @Mapping(target = "billId", source = "bill.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "hsnCode", source = "product.hsnCode")
    @Mapping(target = "salesUnit", source = "product.salesUnit")
    BillItemResponse toResponse(BillItem entity);

    /**
     * Maps list of Bill entities to list of BillResponse
     */
    List<BillResponse> toResponseList(List<Bill> entities);

    /**
     * Maps list of BillItem entities to list of BillItemResponse
     */
    List<BillItemResponse> toBillItemResponseList(List<BillItem> entities);

    /**
     * Updates Bill entity from UpdateBillRequest
     */
    // Do not map customer relation here; service handles setting a managed Customer when needed
    Bill updateEntityFromRequest(UpdateBillRequest request, @MappingTarget Bill entity);
}
