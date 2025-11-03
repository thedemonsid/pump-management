package com.reallink.pump.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateManagerRequest;
import com.reallink.pump.dto.request.UpdateManagerRequest;
import com.reallink.pump.dto.response.ManagerResponse;
import com.reallink.pump.entities.User;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ManagerMapper {

    /**
     * Maps CreateManagerRequest to User entity
     */
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(CreateManagerRequest request);

    /**
     * Maps User entity to ManagerResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    ManagerResponse toResponse(User entity);

    /**
     * Updates User entity from UpdateManagerRequest
     */
    void updateEntityFromRequest(UpdateManagerRequest request, @MappingTarget User entity);

    @Named("toIST")
    default LocalDateTime toIST(LocalDateTime utcDateTime) {
        if (utcDateTime == null) {
            return null;
        }
        ZonedDateTime utcZoned = utcDateTime.atZone(ZoneId.of("UTC"));
        ZonedDateTime istZoned = utcZoned.withZoneSameInstant(ZoneId.of("Asia/Kolkata"));
        return istZoned.toLocalDateTime();
    }
}
