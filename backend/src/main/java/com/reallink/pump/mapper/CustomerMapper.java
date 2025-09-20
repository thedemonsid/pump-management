package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateCustomerRequest;
import com.reallink.pump.dto.request.UpdateCustomerRequest;
import com.reallink.pump.dto.response.CustomerResponse;
import com.reallink.pump.entities.Customer;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CustomerMapper {

    /**
     * Maps CreateCustomerRequest to Customer entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    Customer toEntity(CreateCustomerRequest request);

    /**
     * Maps Customer entity to CustomerResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    CustomerResponse toResponse(Customer entity);

    /**
     * Maps list of Customer entities to list of CustomerResponse
     */
    List<CustomerResponse> toResponseList(List<Customer> entities);

    /**
     * Updates Customer entity from UpdateCustomerRequest
     */
    void updateEntityFromRequest(UpdateCustomerRequest request, @MappingTarget Customer entity);
}
