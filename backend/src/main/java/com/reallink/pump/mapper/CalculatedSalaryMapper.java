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

import com.reallink.pump.dto.request.CreateCalculatedSalaryRequest;
import com.reallink.pump.dto.request.UpdateCalculatedSalaryRequest;
import com.reallink.pump.dto.response.CalculatedSalaryResponse;
import com.reallink.pump.entities.CalculatedSalary;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CalculatedSalaryMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "salaryConfig", ignore = true)
    CalculatedSalary toEntity(CreateCalculatedSalaryRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "salaryConfigId", source = "salaryConfig.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    CalculatedSalaryResponse toResponse(CalculatedSalary entity);

    void updateEntityFromRequest(UpdateCalculatedSalaryRequest request, @MappingTarget CalculatedSalary entity);

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
