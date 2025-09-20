package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateCustomerBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateCustomerBillPaymentRequest;
import com.reallink.pump.dto.response.CustomerBillPaymentResponse;
import com.reallink.pump.entities.CustomerBillPayment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CustomerBillPaymentMapper {

    /**
     * Maps CreateCustomerBillPaymentRequest to CustomerBillPayment entity
     */
    // Do not map relations by id here; service will set managed entities to avoid detached instances
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "bill", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    CustomerBillPayment toEntity(CreateCustomerBillPaymentRequest request);

    /**
     * Maps CustomerBillPayment entity to CustomerBillPaymentResponse
     */
    @Mapping(target = "billId", source = "bill.id")
    @Mapping(target = "billNo", source = "bill.billNo")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "bankAccountHolderName", source = "bankAccount.accountHolderName")
    CustomerBillPaymentResponse toResponse(CustomerBillPayment entity);

    /**
     * Maps list of CustomerBillPayment entities to list of
     * CustomerBillPaymentResponse
     */
    List<CustomerBillPaymentResponse> toResponseList(List<CustomerBillPayment> entities);

    /**
     * Updates CustomerBillPayment entity from UpdateCustomerBillPaymentRequest
     */
    // Do not map relations here; service handles setting managed entities when needed
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "bill", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    CustomerBillPayment updateEntityFromRequest(UpdateCustomerBillPaymentRequest request, @MappingTarget CustomerBillPayment entity);
}
