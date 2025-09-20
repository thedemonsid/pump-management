package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateTankRequest;
import com.reallink.pump.dto.request.UpdateTankRequest;
import com.reallink.pump.dto.response.TankResponse;
import com.reallink.pump.entities.Tank;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TankMapper {

    /**
     * Maps CreateTankRequest to Tank entity Product relationship should be set
     * separately in the service layer
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "nozzles", ignore = true)
    @Mapping(target = "currentLevel", defaultValue = "0.0")
    Tank toEntity(CreateTankRequest request);

    /**
     * Maps Tank entity to TankResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "product.id", source = "product.id")
    @Mapping(target = "product.productName", source = "product.productName")
    @Mapping(target = "product.salesUnit", source = "product.salesUnit")
    @Mapping(target = "nozzleCount", expression = "java(entity.getNozzles() != null ? entity.getNozzles().size() : 0)")
    @Mapping(target = "availableCapacity", expression = "java(entity.getAvailableCapacity())")
    @Mapping(target = "fillPercentage", expression = "java(entity.getFillPercentage())")
    @Mapping(target = "isLowLevel", expression = "java(entity.isLowLevel())")
    TankResponse toResponse(Tank entity);

    /**
     * Maps list of Tank entities to list of TankResponse
     */
    List<TankResponse> toResponseList(List<Tank> entities);

    /**
     * Updates existing Tank entity with UpdateTankRequest data Only non-null
     * values from the request will be mapped
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "nozzles", ignore = true)
    void updateEntity(UpdateTankRequest request, @MappingTarget Tank entity);

    /**
     * Partial update - only updates non-null fields from CreateTankRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "nozzles", ignore = true)
    void partialUpdate(CreateTankRequest request, @MappingTarget Tank entity);
}
