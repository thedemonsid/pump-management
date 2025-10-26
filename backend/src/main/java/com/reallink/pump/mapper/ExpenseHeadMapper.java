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

import com.reallink.pump.dto.request.CreateExpenseHeadRequest;
import com.reallink.pump.dto.request.UpdateExpenseHeadRequest;
import com.reallink.pump.dto.response.ExpenseHeadResponse;
import com.reallink.pump.entities.ExpenseHead;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ExpenseHeadMapper {

    /**
     * Maps CreateExpenseHeadRequest to ExpenseHead entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    ExpenseHead toEntity(CreateExpenseHeadRequest request);

    /**
     * Maps ExpenseHead entity to ExpenseHeadResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    ExpenseHeadResponse toResponse(ExpenseHead entity);

    /**
     * Maps list of ExpenseHead entities to list of ExpenseHeadResponse
     */
    List<ExpenseHeadResponse> toResponseList(List<ExpenseHead> entities);

    /**
     * Updates ExpenseHead entity from UpdateExpenseHeadRequest
     */
    void updateEntityFromRequest(UpdateExpenseHeadRequest request, @MappingTarget ExpenseHead entity);

    /**
     * Converts UTC timestamp to IST
     */
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
