package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentMethod;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeSalaryPaymentRequest {

    private UUID calculatedSalaryId;

    @NotNull(message = "Bank account ID is required")
    private UUID bankAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDateTime paymentDate;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Reference number is required")
    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    private String referenceNumber;

    @Size(max = 500, message = "Notes must be less than 500 characters")
    private String notes;
}
