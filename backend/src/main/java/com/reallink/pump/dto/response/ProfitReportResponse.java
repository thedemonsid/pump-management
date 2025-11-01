package com.reallink.pump.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Profit report response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfitReportResponse {

    /**
     * Period type: DAY, MONTH, or YEAR
     */
    private String periodType;

    /**
     * Start date of the period
     */
    private String startDate;

    /**
     * End date of the period
     */
    private String endDate;

    /**
     * Fuel profit breakdown
     */
    private FuelProfitBreakdown fuelProfitBreakdown;

    /**
     * Fuel metrics
     */
    private FuelMetrics fuelMetrics;

    /**
     * Product-wise profit (for each fuel type)
     */
    private List<ProductWiseProfit> productWiseProfit;

    /**
     * Expense breakdown by category
     */
    private List<ExpenseBreakdown> expenseBreakdown;

    /**
     * Report generated timestamp
     */
    private LocalDateTime generatedAt;
}
