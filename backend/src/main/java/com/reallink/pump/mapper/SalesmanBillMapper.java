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

import com.reallink.pump.dto.request.CreateSalesmanBillRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillRequest;
import com.reallink.pump.dto.response.SalesmanBillResponse;
import com.reallink.pump.entities.SalesmanBill;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SalesmanBillMapper {

    /**
     * Maps CreateSalesmanBillRequest to SalesmanBill entity
     */
    // Do not map relations by id here; service will set managed entities to avoid detached instances
    @Mapping(target = "pumpMaster", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "salesmanShift", ignore = true)
    SalesmanBill toEntity(CreateSalesmanBillRequest request);

    /**
     * Maps SalesmanBill entity to SalesmanBillResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "salesmanShiftId", source = "salesmanShift.id")
    @Mapping(target = "salesmanUsername", source = "salesmanShift.salesman.username")
    @Mapping(target = "meterImageId", source = "meterImage.id")
    @Mapping(target = "vehicleImageId", source = "vehicleImage.id")
    @Mapping(target = "extraImageId", source = "extraImage.id")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    SalesmanBillResponse toResponse(SalesmanBill entity);

    /**
     * Updates SalesmanBill entity from UpdateSalesmanBillRequest
     */
    // Do not map customer relation here; service handles setting a managed Customer when needed
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "salesmanShift", ignore = true)
    SalesmanBill updateEntityFromRequest(UpdateSalesmanBillRequest request, @MappingTarget SalesmanBill entity);

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
