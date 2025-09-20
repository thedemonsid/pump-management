package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateSalesmanShiftRequest;
import com.reallink.pump.dto.request.UpdateSalesmanShiftRequest;
import com.reallink.pump.dto.response.SalesmanShiftResponse;
import com.reallink.pump.entities.SalesmanShift;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SalesmanShiftMapper {

    /**
     * Maps CreateSalesmanShiftRequest to SalesmanShift entity Salesman and
     * Shift relationships should be set separately in the service layer
     */
    @Mapping(target = "salesman", ignore = true)
    @Mapping(target = "shift", ignore = true)
    @Mapping(target = "nozzleReadings", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    SalesmanShift toEntity(CreateSalesmanShiftRequest request);

    /**
     * Maps SalesmanShift entity to SalesmanShiftResponse
     */
    @Mapping(target = "salesman.id", source = "salesman.id")
    @Mapping(target = "salesman.name", source = "salesman.name")
    @Mapping(target = "salesman.employeeId", source = "salesman.employeeId")
    @Mapping(target = "shift.id", source = "shift.id")
    @Mapping(target = "shift.name", source = "shift.name")
    @Mapping(target = "shift.startTime", source = "shift.startTime")
    @Mapping(target = "shift.endTime", source = "shift.endTime")
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "assignmentStartDate", ignore = true)
    @Mapping(target = "assignmentEndDate", ignore = true)
    @Mapping(target = "totalSales", ignore = true)
    @Mapping(target = "transactionCount", expression = "java(entity.getNozzleReadings() != null ? entity.getNozzleReadings().size() : 0)")
    @Mapping(target = "notes", ignore = true)
    SalesmanShiftResponse toResponse(SalesmanShift entity);

    /**
     * Maps list of SalesmanShift entities to list of SalesmanShiftResponse
     */
    List<SalesmanShiftResponse> toResponseList(List<SalesmanShift> entities);

    /**
     * Updates existing SalesmanShift entity with UpdateSalesmanShiftRequest
     * data Only non-null values from the request will be mapped
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "salesman", ignore = true)
    @Mapping(target = "shift", ignore = true)
    @Mapping(target = "nozzleReadings", ignore = true)
    void updateEntity(UpdateSalesmanShiftRequest request, @MappingTarget SalesmanShift entity);

    /**
     * Partial update - only updates non-null fields from
     * CreateSalesmanShiftRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "salesman", ignore = true)
    @Mapping(target = "shift", ignore = true)
    @Mapping(target = "nozzleReadings", ignore = true)
    void partialUpdate(CreateSalesmanShiftRequest request, @MappingTarget SalesmanShift entity);
}
