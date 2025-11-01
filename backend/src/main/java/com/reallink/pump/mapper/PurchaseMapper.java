package com.reallink.pump.mapper;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreatePurchaseItemRequest;
import com.reallink.pump.dto.request.CreatePurchaseRequest;
import com.reallink.pump.dto.request.UpdatePurchaseRequest;
import com.reallink.pump.dto.response.PurchaseItemResponse;
import com.reallink.pump.dto.response.PurchaseResponse;
import com.reallink.pump.dto.response.SupplierPaymentResponse;
import com.reallink.pump.entities.Purchase;
import com.reallink.pump.entities.PurchaseItem;
import com.reallink.pump.entities.SupplierPayment;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PurchaseMapper {

    /**
     * Maps CreatePurchaseRequest to Purchase entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    @Mapping(target = "supplier.id", source = "supplierId")
    @Mapping(target = "purchaseItems", ignore = true)
    @Mapping(target = "supplierPayments", ignore = true)
    Purchase toEntity(CreatePurchaseRequest request);

    /**
     * Maps CreatePurchaseItemRequest to PurchaseItem entity
     */
    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "purchase", ignore = true)
    @Mapping(target = "taxAmount", ignore = true)
    @Mapping(target = "amount", ignore = true)
    PurchaseItem toEntity(CreatePurchaseItemRequest request);

    /**
     * Maps Purchase entity to PurchaseResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.supplierName")
    @Mapping(target = "purchaseItems", source = "purchaseItems", qualifiedByName = "toPurchaseItemResponseList")
    @Mapping(target = "supplierPayments", source = "supplierPayments", qualifiedByName = "toSupplierPaymentResponseList")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toIST")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toIST")
    PurchaseResponse toResponse(Purchase entity);

    /**
     * Maps PurchaseItem entity to PurchaseItemResponse
     */
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    PurchaseItemResponse toResponse(PurchaseItem entity);

    /**
     * Maps list of Purchase entities to list of PurchaseResponse
     */
    List<PurchaseResponse> toResponseList(List<Purchase> entities);

    /**
     * Updates Purchase entity from UpdatePurchaseRequest
     */
    @Mapping(target = "supplier.id", source = "supplierId")
    @Mapping(target = "purchaseItems", ignore = true)
    void updateEntityFromRequest(UpdatePurchaseRequest request, @MappingTarget Purchase entity);

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

    @Named("toPurchaseItemResponseList")
    default List<PurchaseItemResponse> toPurchaseItemResponseList(java.util.Set<PurchaseItem> purchaseItems) {
        if (purchaseItems == null) {
            return new java.util.ArrayList<>();
        }
        return purchaseItems.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Named("toSupplierPaymentResponseList")
    default List<SupplierPaymentResponse> toSupplierPaymentResponseList(java.util.Set<SupplierPayment> supplierPayments) {
        if (supplierPayments == null) {
            return new java.util.ArrayList<>();
        }
        return supplierPayments.stream()
                .map(this::toSupplierPaymentResponse)
                .collect(Collectors.toList());
    }

    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "purchaseId", source = "purchase.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    SupplierPaymentResponse toSupplierPaymentResponse(SupplierPayment entity);
}
