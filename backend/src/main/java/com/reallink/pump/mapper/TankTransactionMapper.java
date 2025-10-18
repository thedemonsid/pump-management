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

import com.reallink.pump.dto.request.CreateTankTransactionRequest;
import com.reallink.pump.dto.response.TankTransactionResponse;
import com.reallink.pump.entities.TankTransaction;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TankTransactionMapper {

    @Mapping(target = "tankId", source = "tank.id")
    @Mapping(target = "tankName", source = "tank.tankName")
    @Mapping(target = "fuelPurchaseId", source = "fuelPurchase.id")
    @Mapping(target = "fuelPurchaseInvoiceNumber", source = "fuelPurchase.invoiceNumber")
    @Mapping(target = "transactionDate", source = "transactionDate", qualifiedByName = "toIST")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    TankTransactionResponse toResponse(TankTransaction entity);

    List<TankTransactionResponse> toResponseList(List<TankTransaction> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tank", ignore = true)
    @Mapping(target = "transactionType", ignore = true)
    @Mapping(target = "entryBy", ignore = true)
    TankTransaction toEntity(CreateTankTransactionRequest request);

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
