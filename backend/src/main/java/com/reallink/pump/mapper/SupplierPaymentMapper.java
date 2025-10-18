package com.reallink.pump.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.reallink.pump.dto.request.CreateSupplierPaymentRequest;
import com.reallink.pump.dto.request.UpdateSupplierPaymentRequest;
import com.reallink.pump.dto.response.SupplierPaymentResponse;
import com.reallink.pump.entities.SupplierPayment;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SupplierPaymentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "purchase", ignore = true)
    @Mapping(target = "fuelPurchase", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    @Mapping(target = "entryBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    SupplierPayment toEntity(CreateSupplierPaymentRequest request);

    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "purchaseId", source = "purchase.id")
    @Mapping(target = "fuelPurchaseId", source = "fuelPurchase.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "paymentDate", source = "paymentDate", qualifiedByName = "toIST")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    SupplierPaymentResponse toResponse(SupplierPayment entity);

    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "purchase", ignore = true)
    @Mapping(target = "fuelPurchase", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "bankAccount", ignore = true)
    @Mapping(target = "bankTransaction", ignore = true)
    @Mapping(target = "entryBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromRequest(UpdateSupplierPaymentRequest request, @MappingTarget SupplierPayment entity);

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
