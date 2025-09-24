package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateSalesmanRequest;
import com.reallink.pump.dto.request.UpdateSalesmanRequest;
import com.reallink.pump.dto.response.SalesmanResponse;
import com.reallink.pump.entities.User;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SalesmanMapper {

    /**
     * Maps CreateSalesmanRequest to User entity
     */
    @Mapping(target = "pumpMaster", ignore = true) // Will be set manually in service
    @Mapping(target = "role", ignore = true) // Will be set to SALESMAN in service
    User toEntity(CreateSalesmanRequest request);

    /**
     * Maps User entity to SalesmanResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    SalesmanResponse toResponse(User entity);

    /**
     * Maps list of User entities to list of SalesmanResponse
     */
    List<SalesmanResponse> toResponseList(List<User> entities);

    /**
     * Updates User entity from UpdateSalesmanRequest
     */
    void updateEntityFromRequest(UpdateSalesmanRequest request, @MappingTarget User entity);
}
