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

import com.reallink.pump.dto.request.CreateDipReadingRequest;
import com.reallink.pump.dto.request.UpdateDipReadingRequest;
import com.reallink.pump.dto.response.DipReadingResponse;
import com.reallink.pump.entities.DipReading;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface DipReadingMapper {

    /**
     * Maps CreateDipReadingRequest to DipReading entity Tank and PumpMaster
     * relationships should be set separately in the service layer
     */
    @Mapping(target = "tank", ignore = true)
    @Mapping(target = "pumpMaster", ignore = true)
    DipReading toEntity(CreateDipReadingRequest request);

    /**
     * Maps DipReading entity to DipReadingResponse
     */
    @Mapping(target = "tankId", source = "tank.id")
    @Mapping(target = "tankName", source = "tank.tankName")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "pumpMasterName", source = "pumpMaster.pumpName")
    @Mapping(target = "productName", source = "tank.product.productName")
    @Mapping(target = "tank", source = "tank")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    DipReadingResponse toResponse(DipReading entity);

    /**
     * Maps Tank entity to TankSummary for response
     */
    @Mapping(target = "tankName", source = "tankName")
    @Mapping(target = "capacity", source = "capacity")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "tankLocation", source = "tankLocation")
    @Mapping(target = "currentLevel", ignore = true)
    DipReadingResponse.TankSummary toTankSummary(com.reallink.pump.entities.Tank tank);

    /**
     * Maps list of DipReading entities to list of DipReadingResponse
     */
    List<DipReadingResponse> toResponseList(List<DipReading> entities);

    /**
     * Updates existing DipReading entity with UpdateDipReadingRequest data Only
     * non-null fields from the request will update the entity
     */
    @Mapping(target = "tank", ignore = true)
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromRequest(UpdateDipReadingRequest request, @MappingTarget DipReading entity);

    /**
     * Converts LocalDateTime to IST timezone
     */
    @Named("toIST")
    default LocalDateTime toIST(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        ZonedDateTime istTime = dateTime.atZone(ZoneId.systemDefault())
                .withZoneSameInstant(ZoneId.of("Asia/Kolkata"));
        return istTime.toLocalDateTime();
    }
}
