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

import com.reallink.pump.dto.request.CreateUserAbsenceRequest;
import com.reallink.pump.dto.request.UpdateUserAbsenceRequest;
import com.reallink.pump.dto.response.UserAbsenceResponse;
import com.reallink.pump.entities.UserAbsence;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserAbsenceMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "pumpMaster", ignore = true)
    UserAbsence toEntity(CreateUserAbsenceRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "userRole", source = "user.role.roleName")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    UserAbsenceResponse toResponse(UserAbsence entity);

    void updateEntityFromRequest(UpdateUserAbsenceRequest request, @MappingTarget UserAbsence entity);

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
