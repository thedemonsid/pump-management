package com.reallink.pump.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.response.SalesmanBillPaymentResponse;
import com.reallink.pump.entities.SalesmanBillPayment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SalesmanBillPaymentMapper {

    /**
     * Maps CreateSalesmanBillPaymentRequest to SalesmanBillPayment entity
     */
    // Do not map relations by id here; service will set managed entities to avoid detached instances
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "salesmanShift", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "salesmanBill", ignore = true)
    SalesmanBillPayment toEntity(CreateSalesmanBillPaymentRequest request);

    /**
     * Maps SalesmanBillPayment entity to SalesmanBillPaymentResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "salesmanShiftId", source = "salesmanShift.id")
    @Mapping(target = "salesmanId", source = "salesmanShift.salesman.id")
    @Mapping(target = "salesmanName", source = "salesmanShift.salesman.username")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "salesmanBillId", source = "salesmanBill.id")
    @Mapping(target = "paymentDate", source = "paymentDate", qualifiedByName = "toIST")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    SalesmanBillPaymentResponse toResponse(SalesmanBillPayment entity);

    /**
     * Updates SalesmanBillPayment entity from UpdateSalesmanBillPaymentRequest
     */
    // Do not map relations here; service handles setting managed entities
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "salesmanShift", ignore = true)
    @Mapping(target = "customer", ignore = true)
    SalesmanBillPayment updateEntityFromRequest(UpdateSalesmanBillPaymentRequest request, @MappingTarget SalesmanBillPayment entity);

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
