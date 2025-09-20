package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreatePumpInfoMasterRequest;
import com.reallink.pump.dto.request.UpdatePumpInfoMasterRequest;
import com.reallink.pump.dto.response.PumpInfoMasterResponse;
import com.reallink.pump.entities.PumpInfoMaster;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PumpInfoMasterMapper {

    /**
     * Maps CreatePumpInfoMasterRequest to PumpInfoMaster entity
     */
    PumpInfoMaster toEntity(CreatePumpInfoMasterRequest request);

    /**
     * Maps PumpInfoMaster entity to PumpInfoMasterResponse
     */
    PumpInfoMasterResponse toResponse(PumpInfoMaster entity);

    /**
     * Maps list of PumpInfoMaster entities to list of PumpInfoMasterResponse
     */
    List<PumpInfoMasterResponse> toResponseList(List<PumpInfoMaster> entities);

    /**
     * Updates existing PumpInfoMaster entity with UpdatePumpInfoMasterRequest
     * data Only non-null values from the request will be mapped
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(UpdatePumpInfoMasterRequest request, @MappingTarget PumpInfoMaster entity);

    /**
     * Partial update - only updates non-null fields from
     * CreatePumpInfoMasterRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void partialUpdate(CreatePumpInfoMasterRequest request, @MappingTarget PumpInfoMaster entity);
}
