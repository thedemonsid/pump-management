package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLedgerEntryResponse {

    private LocalDateTime date;
    private String action; // "Salary Calculated" or "Payment Made"
    private String type; // "credit" or "debit"
    private BigDecimal creditAmount; // Calculated salary amount
    private BigDecimal debitAmount; // Payment amount
    private BigDecimal balance; // Running balance
    private String description;
    private String referenceId; // ID of calculated salary or payment
    private String referenceType; // "SALARY" or "PAYMENT"
    private String paymentMethod; // Only for payments
    private String referenceNumber; // Only for payments
}
