package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalaryPaymentResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private UUID pumpMasterId;
    private UUID calculatedSalaryId;
    private UUID bankAccountId;
    private String bankAccountNumber;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
