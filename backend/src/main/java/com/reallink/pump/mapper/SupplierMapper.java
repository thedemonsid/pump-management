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

import com.reallink.pump.dto.request.CreateSupplierRequest;
import com.reallink.pump.dto.request.UpdateSupplierRequest;
import com.reallink.pump.dto.response.SupplierResponse;
import com.reallink.pump.entities.Supplier;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SupplierMapper {

    /**
     * Maps CreateSupplierRequest to Supplier entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    Supplier toEntity(CreateSupplierRequest request);

    /**
     * Maps Supplier entity to SupplierResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    SupplierResponse toResponse(Supplier entity);

    /**
     * Maps list of Supplier entities to list of SupplierResponse
     */
    List<SupplierResponse> toResponseList(List<Supplier> entities);

    /**
     * Updates Supplier entity from UpdateSupplierRequest
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    void updateEntityFromRequest(UpdateSupplierRequest request, @MappingTarget Supplier entity);

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
