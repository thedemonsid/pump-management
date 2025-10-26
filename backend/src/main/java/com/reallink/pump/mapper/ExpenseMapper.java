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

import com.reallink.pump.dto.request.CreateExpenseRequest;
import com.reallink.pump.dto.request.UpdateExpenseRequest;
import com.reallink.pump.dto.response.ExpenseResponse;
import com.reallink.pump.entities.Expense;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ExpenseMapper {

    /**
     * Maps CreateExpenseRequest to Expense entity Note: pumpMaster,
     * expenseHead, salesmanNozzleShift, and bankAccount should be set manually
     * in the service after fetching from repositories
     */
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "expenseHead", ignore = true)
    @Mapping(target = "salesmanNozzleShift", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    Expense toEntity(CreateExpenseRequest request);

    /**
     * Maps Expense entity to ExpenseResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "expenseHeadId", source = "expenseHead.id")
    @Mapping(target = "expenseHeadName", source = "expenseHead.headName")
    @Mapping(target = "salesmanNozzleShiftId", source = "salesmanNozzleShift.id")
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "bankAccountNumber", source = "bankAccount.accountNumber")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    ExpenseResponse toResponse(Expense entity);

    /**
     * Maps list of Expense entities to list of ExpenseResponse
     */
    List<ExpenseResponse> toResponseList(List<Expense> entities);

    /**
     * Updates Expense entity from UpdateExpenseRequest
     */
    @Mapping(target = "expenseHead.id", source = "expenseHeadId")
    @Mapping(target = "salesmanNozzleShift.id", source = "salesmanNozzleShiftId")
    @Mapping(target = "bankAccount.id", source = "bankAccountId")
    void updateEntityFromRequest(UpdateExpenseRequest request, @MappingTarget Expense entity);

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
