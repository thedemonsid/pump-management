package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Fuel profit breakdown for profit reports
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelProfitBreakdown {

    /**
     * Total revenue from fuel sales
     */
    private BigDecimal fuelSalesRevenue;

    /**
     * Total fuel purchases cost
     */
    private BigDecimal fuelPurchasesCost;

    /**
     * Total operating expenses
     */
    private BigDecimal operatingExpenses;

    /**
     * Gross profit (Revenue - Purchase Cost)
     */
    private BigDecimal grossProfit;

    /**
     * Net profit (Gross Profit - Operating Expenses)
     */
    private BigDecimal netProfit;

    /**
     * Profit margin percentage
     */
    private BigDecimal profitMargin;
}
