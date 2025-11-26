package com.reallink.pump.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLedgerSummaryResponse {

    private BigDecimal openingBalance; // Always 0 for employees (no opening balance)

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
