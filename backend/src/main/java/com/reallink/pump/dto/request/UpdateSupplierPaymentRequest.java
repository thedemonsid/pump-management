package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentMethod;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSupplierPaymentRequest {

    private UUID pumpMasterId;

    private UUID purchaseId;

    private UUID fuelPurchaseId;

    private UUID supplierId;

    private UUID bankAccountId;

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    private BigDecimal amount;

    private LocalDateTime paymentDate;

    private PaymentMethod paymentMethod;

    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    private String referenceNumber;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    private String notes;
}
