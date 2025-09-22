package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateNozzleReadingRequest;
import com.reallink.pump.dto.request.UpdateNozzleReadingRequest;
import com.reallink.pump.dto.response.NozzleReadingResponse;
import com.reallink.pump.entities.NozzleReading;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface NozzleReadingMapper {

    /**
     * Maps CreateNozzleReadingRequest to NozzleReading entity Nozzle and
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    @Mapping(target = "nozzle", ignore = true)
    @Mapping(target = "closingReading", ignore = true)
    @Mapping(target = "volumeDispensed", ignore = true)
    @Mapping(target = "amountCollected", ignore = true)
    @Mapping(target = "status", constant = "OPEN")
    NozzleReading toEntity(CreateNozzleReadingRequest request);

    /**
     * Maps NozzleReading entity to NozzleReadingResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "nozzleId", source = "nozzle.id")
    @Mapping(target = "nozzleName", source = "nozzle.nozzleName")
    @Mapping(target = "reading", source = "openingReading")
    @Mapping(target = "previousReading", source = "nozzle.previousReading")
    @Mapping(target = "difference", expression = "java(entity.getVolumeDispensed() != null ? entity.getVolumeDispensed() : java.math.BigDecimal.ZERO)")
    @Mapping(target = "readingDateTime", source = "readingTime")
    NozzleReadingResponse toResponse(NozzleReading entity);

    /**
     * Maps list of NozzleReading entities to list of NozzleReadingResponse
     */
    List<NozzleReadingResponse> toResponseList(List<NozzleReading> entities);

    /**
     * Updates existing NozzleReading entity with UpdateNozzleReadingRequest
     * data Only non-null values from the request will be mapped
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "nozzle", ignore = true)
    @Mapping(target = "openingReading", ignore = true)
    void updateEntity(UpdateNozzleReadingRequest request, @MappingTarget NozzleReading entity);

    /**
     * Partial update - only updates non-null fields from
     * CreateNozzleReadingRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "nozzle", ignore = true)
    void partialUpdate(CreateNozzleReadingRequest request, @MappingTarget NozzleReading entity);
}
