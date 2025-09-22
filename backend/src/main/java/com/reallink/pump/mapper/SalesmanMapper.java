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
import com.reallink.pump.entities.Salesman;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SalesmanMapper {

    /**
     * Maps CreateSalesmanRequest to Salesman entity
     */
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    Salesman toEntity(CreateSalesmanRequest request);

    /**
     * Maps Salesman entity to SalesmanResponse
     */
    @Mapping(target = "contactNumber", source = "contactNumber")
    @Mapping(target = "active", source = "active")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    SalesmanResponse toResponse(Salesman entity);

    /**
     * Maps list of Salesman entities to list of SalesmanResponse
     */
    List<SalesmanResponse> toResponseList(List<Salesman> entities);

    /**
     * Updates existing Salesman entity with UpdateSalesmanRequest data Only
     * non-null values from the request will be mapped
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(UpdateSalesmanRequest request, @MappingTarget Salesman entity);

    /**
     * Partial update - only updates non-null fields from CreateSalesmanRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void partialUpdate(CreateSalesmanRequest request, @MappingTarget Salesman entity);
}
