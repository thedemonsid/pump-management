package com.reallink.pump.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateSalesmanNozzleShiftRequest;
import com.reallink.pump.dto.response.SalesmanNozzleShiftResponse;
import com.reallink.pump.entities.SalesmanNozzleShift;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SalesmanNozzleShiftMapper {

    /**
     * Maps CreateSalesmanNozzleShiftRequest to SalesmanNozzleShift entity
     */
    @Mapping(target = "salesman", ignore = true) // Will be set manually in service
    @Mapping(target = "nozzle", ignore = true) // Will be set manually in service
    @Mapping(target = "pumpMaster", ignore = true) // Will be set manually in service
    @Mapping(target = "openingBalance", ignore = true) // Will be set manually in service
    @Mapping(target = "productPrice", ignore = true) // Will be set manually in service
    SalesmanNozzleShift toEntity(CreateSalesmanNozzleShiftRequest request);

    /**
     * Maps SalesmanNozzleShift entity to SalesmanNozzleShiftResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "salesmanId", source = "salesman.id")
    @Mapping(target = "salesmanUsername", source = "salesman.username")
    @Mapping(target = "nozzleId", source = "nozzle.id")
    @Mapping(target = "nozzleName", source = "nozzle.nozzleName")
    @Mapping(target = "nozzleCompanyName", source = "nozzle.companyName")
    @Mapping(target = "nozzleLocation", source = "nozzle.location")
    @Mapping(target = "nozzleStatus", source = "nozzle.status")
    @Mapping(target = "tankId", source = "nozzle.tank.id")
    @Mapping(target = "tankName", source = "nozzle.tank.tankName")
    @Mapping(target = "productName", source = "nozzle.tank.product.productName")
    @Mapping(target = "status", expression = "java(entity.getStatus().name())")
    @Mapping(target = "dispensedAmount", expression = "java(entity.getDispensedAmount())")
    @Mapping(target = "totalAmount", expression = "java(entity.getTotalAmount())")
    @Mapping(target = "startDateTime", source = "startDateTime", qualifiedByName = "toIST")
    @Mapping(target = "endDateTime", source = "endDateTime", qualifiedByName = "toIST")
    SalesmanNozzleShiftResponse toResponse(SalesmanNozzleShift entity);

    /**
     * Maps list of SalesmanNozzleShift entities to list of
     * SalesmanNozzleShiftResponse
     */
    List<SalesmanNozzleShiftResponse> toResponseList(List<SalesmanNozzleShift> entities);

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
