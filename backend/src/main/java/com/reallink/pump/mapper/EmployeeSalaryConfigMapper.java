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

import com.reallink.pump.dto.request.CreateEmployeeSalaryConfigRequest;
import com.reallink.pump.dto.request.UpdateEmployeeSalaryConfigRequest;
import com.reallink.pump.dto.response.EmployeeSalaryConfigResponse;
import com.reallink.pump.entities.EmployeeSalaryConfig;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface EmployeeSalaryConfigMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "pumpMaster", ignore = true)
    EmployeeSalaryConfig toEntity(CreateEmployeeSalaryConfigRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    EmployeeSalaryConfigResponse toResponse(EmployeeSalaryConfig entity);

    void updateEntityFromRequest(UpdateEmployeeSalaryConfigRequest request, @MappingTarget EmployeeSalaryConfig entity);

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
