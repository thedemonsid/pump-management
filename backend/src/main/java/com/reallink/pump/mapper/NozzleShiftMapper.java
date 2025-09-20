package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateNozzleShiftRequest;
import com.reallink.pump.dto.request.UpdateNozzleShiftRequest;
import com.reallink.pump.dto.response.NozzleShiftResponse;
import com.reallink.pump.entities.NozzleShift;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NozzleShiftMapper {

    /**
     * Maps CreateNozzleShiftRequest to NozzleShift entity
     */
    @Mapping(target = "nozzle", ignore = true)
    @Mapping(target = "salesman", ignore = true)
    @Mapping(target = "nextSalesman", ignore = true)
    NozzleShift toEntity(CreateNozzleShiftRequest request);

    /**
     * Maps NozzleShift entity to NozzleShiftResponse
     */
    @Mapping(target = "nozzleId", source = "nozzle.id")
    @Mapping(target = "salesmanId", source = "salesman.id")
    @Mapping(target = "nextSalesmanId", source = "nextSalesman.id")
    @Mapping(target = "dispensedAmount", expression = "java(entity.getDispensedAmount())")
    @Mapping(target = "totalValue", expression = "java(entity.getTotalValue())")
    @Mapping(target = "closed", expression = "java(entity.isClosed())")
    @Mapping(target = "nozzle.id", source = "nozzle.id")
    @Mapping(target = "nozzle.nozzleName", source = "nozzle.nozzleName")
    @Mapping(target = "nozzle.companyName", source = "nozzle.companyName")
    @Mapping(target = "salesman.id", source = "salesman.id")
    @Mapping(target = "salesman.name", source = "salesman.name")
    @Mapping(target = "salesman.employeeId", source = "salesman.employeeId")
    @Mapping(target = "nextSalesman.id", source = "nextSalesman.id")
    @Mapping(target = "nextSalesman.name", source = "nextSalesman.name")
    @Mapping(target = "nextSalesman.employeeId", source = "nextSalesman.employeeId")
    NozzleShiftResponse toResponse(NozzleShift entity);

    /**
     * Maps list of NozzleShift entities to list of NozzleShiftResponse
     */
    List<NozzleShiftResponse> toResponseList(List<NozzleShift> entities);

    /**
     * Updates NozzleShift entity with UpdateNozzleShiftRequest data
     */
    @Mapping(target = "nextSalesman", ignore = true)
    void updateEntity(@MappingTarget NozzleShift entity, UpdateNozzleShiftRequest request);
}
