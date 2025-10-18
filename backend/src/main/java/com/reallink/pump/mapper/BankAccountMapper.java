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

import com.reallink.pump.dto.request.CreateBankAccountRequest;
import com.reallink.pump.dto.request.UpdateBankAccountRequest;
import com.reallink.pump.dto.response.BankAccountResponse;
import com.reallink.pump.entities.BankAccount;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BankAccountMapper {

    /**
     * Maps CreateBankAccountRequest to BankAccount entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    BankAccount toEntity(CreateBankAccountRequest request);

    /**
     * Maps BankAccount entity to BankAccountResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    BankAccountResponse toResponse(BankAccount entity);

    /**
     * Maps list of BankAccount entities to list of BankAccountResponse
     */
    List<BankAccountResponse> toResponseList(List<BankAccount> entities);

    /**
     * Updates BankAccount entity from UpdateBankAccountRequest
     */
    void updateEntityFromRequest(UpdateBankAccountRequest request, @MappingTarget BankAccount entity);

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
