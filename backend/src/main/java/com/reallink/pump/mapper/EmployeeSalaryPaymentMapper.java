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

import com.reallink.pump.dto.request.CreateEmployeeSalaryPaymentRequest;
import com.reallink.pump.dto.request.UpdateEmployeeSalaryPaymentRequest;
import com.reallink.pump.dto.response.EmployeeSalaryPaymentResponse;
import com.reallink.pump.entities.EmployeeSalaryPayment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface EmployeeSalaryPaymentMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "calculatedSalary", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    EmployeeSalaryPayment toEntity(CreateEmployeeSalaryPaymentRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "calculatedSalaryId", source = "calculatedSalary.id")
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "bankAccountNumber", source = "bankAccount.accountNumber")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    EmployeeSalaryPaymentResponse toResponse(EmployeeSalaryPayment entity);

    @Mapping(target = "calculatedSalary", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    void updateEntityFromRequest(UpdateEmployeeSalaryPaymentRequest request, @MappingTarget EmployeeSalaryPayment entity);

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
