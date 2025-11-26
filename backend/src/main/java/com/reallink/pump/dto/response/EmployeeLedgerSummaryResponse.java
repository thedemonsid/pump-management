package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLedgerSummaryResponse {

    private BigDecimal openingBalance; // Opening balance from User entity (balance before they started using software)
    private LocalDate openingBalanceDate; // Date when opening balance was set

    // Before the selected date range
    private BigDecimal totalSalariesBefore;
    private BigDecimal totalPaymentsBefore;
    private BigDecimal balanceBefore;

    // Within the selected date range
    private BigDecimal totalSalariesInRange;
    private BigDecimal totalPaymentsInRange;

    // Cumulative totals (till the end date)
    private BigDecimal totalSalariesTillDate;
    private BigDecimal totalPaymentsTillDate;
    private BigDecimal closingBalance;
}
