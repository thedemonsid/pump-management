package com.reallink.pump.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateShiftRequest;
import com.reallink.pump.dto.request.UpdateShiftRequest;
import com.reallink.pump.dto.response.ShiftResponse;
import com.reallink.pump.entities.Shift;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ShiftMapper {

    /**
     * Maps CreateShiftRequest to Shift entity
     */
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    Shift toEntity(CreateShiftRequest request);

    /**
     * Maps Shift entity to ShiftResponse
     */
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    ShiftResponse toResponse(Shift entity);

    /**
     * Maps list of Shift entities to list of ShiftResponse
     */
    List<ShiftResponse> toResponseList(List<Shift> entities);

    /**
     * Updates existing Shift entity with UpdateShiftRequest data Only non-null
     * values from the request will be mapped
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(UpdateShiftRequest request, @MappingTarget Shift entity);

    /**
     * Partial update - only updates non-null fields from CreateShiftRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void partialUpdate(CreateShiftRequest request, @MappingTarget Shift entity);

    /**
     * Convert UTC LocalDateTime to IST LocalDateTime
     */
    @Named("toIST")
    default LocalDateTime toIST(LocalDateTime utcDateTime) {
        if (utcDateTime == null) {
            return null;
        }

        // Assume the LocalDateTime from DB is in UTC
        ZonedDateTime utcZoned = utcDateTime.atZone(ZoneId.of("UTC"));

        // Convert to IST
        ZonedDateTime istZoned = utcZoned.withZoneSameInstant(ZoneId.of("Asia/Kolkata"));

        // Return as LocalDateTime
        return istZoned.toLocalDateTime();
    }
}
