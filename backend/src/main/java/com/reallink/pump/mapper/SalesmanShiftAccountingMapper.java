package com.reallink.pump.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.response.SalesmanShiftAccountingResponse;
import com.reallink.pump.entities.SalesmanShiftAccounting;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SalesmanShiftAccountingMapper {

    /**
     * Maps SalesmanShiftAccounting entity to SalesmanShiftAccountingResponse
     */
    @Mapping(target = "shiftId", source = "salesmanShift.id")
    SalesmanShiftAccountingResponse toResponse(SalesmanShiftAccounting entity);
}
