package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateNozzleRequest;
import com.reallink.pump.dto.request.UpdateNozzleRequest;
import com.reallink.pump.dto.response.NozzleResponse;
import com.reallink.pump.entities.Nozzle;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NozzleMapper {

    /**
     * Maps CreateNozzleRequest to Nozzle entity Tank relationship should be set
     * separately in the service layer
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    @Mapping(target = "tank", ignore = true)
    @Mapping(target = "previousReading", constant = "0.0")
    @Mapping(target = "status", constant = "ACTIVE")
    Nozzle toEntity(CreateNozzleRequest request);

    /**
     * Maps Nozzle entity to NozzleResponse NOTE: tank.currentLevel will be set
     * separately in service layer as it's calculated dynamically
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "tankId", source = "tank.id")
    @Mapping(target = "productName", source = "tank.product.productName")
    @Mapping(target = "tank.id", source = "tank.id")
    @Mapping(target = "tank.tankName", source = "tank.tankName")
    @Mapping(target = "tank.currentLevel", ignore = true)
    @Mapping(target = "tank.capacity", source = "tank.capacity")
    @Mapping(target = "tank.product.id", source = "tank.product.id")
    @Mapping(target = "tank.product.productName", source = "tank.product.productName")
    @Mapping(target = "tank.product.salesUnit", source = "tank.product.salesUnit")
    NozzleResponse toResponse(Nozzle entity);

    /**
     * Maps list of Nozzle entities to list of NozzleResponse
     */
    List<NozzleResponse> toResponseList(List<Nozzle> entities);

    /**
     * Updates existing Nozzle entity with UpdateNozzleRequest data Only
     * non-null values from the request will be mapped
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tank", ignore = true)
    @Mapping(target = "previousReading", ignore = true)
    void updateEntity(UpdateNozzleRequest request, @MappingTarget Nozzle entity);

    /**
     * Partial update - only updates non-null fields from CreateNozzleRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tank", ignore = true)
    @Mapping(target = "previousReading", ignore = true)
    void partialUpdate(CreateNozzleRequest request, @MappingTarget Nozzle entity);
}
