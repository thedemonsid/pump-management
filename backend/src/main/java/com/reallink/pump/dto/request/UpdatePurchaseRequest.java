package com.reallink.pump.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.reallink.pump.entities.PaymentType;
import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing purchase")
public class UpdatePurchaseRequest {

    @NotNull(message = "Purchase date is required")
    @Schema(description = "Purchase date", example = "2023-10-01")
    private LocalDate purchaseDate;

    @NotNull(message = "Rate type is required")
    @Schema(description = "Rate type", example = "INCLUDING_GST")
    private RateType rateType;

    @NotNull(message = "Payment type is required")
    @Schema(description = "Payment type", example = "CASH")
    private PaymentType paymentType;

    @NotNull(message = "Supplier ID is required")
    @Schema(description = "Supplier ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID supplierId;

    @NotBlank(message = "Invoice number is required")
    @Size(max = 50, message = "Invoice number cannot exceed 50 characters")
    @Schema(description = "Invoice number", example = "INV001")
    private String invoiceNumber;

    @Size(max = 100, message = "Goods received by cannot exceed 100 characters")
    @Schema(description = "Goods received by", example = "John Doe")
    private String goodsReceivedBy;

    @Valid
    @Schema(description = "List of purchase items")
    private List<CreatePurchaseItemRequest> purchaseItems;

    @Valid
    @Schema(description = "List of payments")
    private List<CreateSupplierPurchasePaymentRequest> payments;
}
