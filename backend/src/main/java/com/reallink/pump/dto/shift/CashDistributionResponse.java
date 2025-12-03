package com.reallink.pump.dto.shift;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for cash distribution transaction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashDistributionResponse {

    private UUID id;
    private UUID bankAccountId;
    private String bankAccountName;
    private String bankName;
    private String accountNumber;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String entryBy;
    private LocalDateTime createdAt;
}
