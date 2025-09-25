package com.reallink.pump.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.reallink.pump.entities.PaymentType;
import com.reallink.pump.entities.RateType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a bill")
public class UpdateBillRequest {

    @Schema(description = "Bill number", example = "1001")
    private Long billNo;

    @Schema(description = "Bill date", example = "2025-09-14")
    private LocalDate billDate;

    @Schema(description = "Customer ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID customerId;

    @Schema(description = "Payment type", example = "CASH")
    private PaymentType paymentType;

    @Schema(description = "Rate type", example = "INCLUDING_GST")
    private RateType rateType;

    @Valid
    @Schema(description = "List of bill items")
    private List<CreateBillItemRequest> billItems;
}
