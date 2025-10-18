package com.reallink.pump.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateBankTransactionRequest;
import com.reallink.pump.dto.response.BankTransactionResponse;
import com.reallink.pump.entities.BankTransaction;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface BankTransactionMapper {

    /**
     * Maps CreateBankTransactionRequest to BankTransaction entity
     */
    BankTransaction toEntity(CreateBankTransactionRequest request);

    /**
     * Maps BankTransaction entity to BankTransactionResponse
     */
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "transactionDate", source = "transactionDate", qualifiedByName = "toIST")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    BankTransactionResponse toResponse(BankTransaction entity);

    /**
     * Maps list of BankTransaction entities to list of BankTransactionResponse
     */
    List<BankTransactionResponse> toResponseList(List<BankTransaction> entities);

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
