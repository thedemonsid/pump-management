package com.reallink.pump.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.response.SalesmanBillPaymentResponse;
import com.reallink.pump.entities.SalesmanBillPayment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SalesmanBillPaymentMapper {

    /**
     * Maps CreateSalesmanBillPaymentRequest to SalesmanBillPayment entity
     */
    // Do not map relations by id here; service will set managed entities to avoid detached instances
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "salesmanNozzleShift", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    SalesmanBillPayment toEntity(CreateSalesmanBillPaymentRequest request);

    /**
     * Maps SalesmanBillPayment entity to SalesmanBillPaymentResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "salesmanNozzleShiftId", source = "salesmanNozzleShift.id")
    @Mapping(target = "salesmanName", source = "salesmanNozzleShift.salesman.username")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "bankAccountName", source = "bankAccount.accountHolderName")
    @Mapping(target = "bankTransactionId", source = "bankTransaction.id")
    SalesmanBillPaymentResponse toResponse(SalesmanBillPayment entity);

    /**
     * Updates SalesmanBillPayment entity from UpdateSalesmanBillPaymentRequest
     */
    // Do not map relations here; service handles setting managed entities
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "salesmanNozzleShift", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    SalesmanBillPayment updateEntityFromRequest(UpdateSalesmanBillPaymentRequest request, @MappingTarget SalesmanBillPayment entity);
}
