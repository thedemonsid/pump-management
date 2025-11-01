package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Fuel metrics for profit reports
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelMetrics {

    /**
     * Total fuel quantity sold (in liters)
     */
    private BigDecimal totalFuelSold;

    /**
     * Total fuel quantity purchased (in liters)
     */
    private BigDecimal totalFuelPurchased;

    /**
     * Average selling price per liter
     */
    private BigDecimal averageSellingPrice;

    /**
     * Average purchase price per liter
     */
    private BigDecimal averagePurchasePrice;

    /**
     * Number of fuel bills generated
     */
    private Long fuelBillsCount;

    /**
     * Number of fuel purchases made
     */
    private Long fuelPurchasesCount;
}
