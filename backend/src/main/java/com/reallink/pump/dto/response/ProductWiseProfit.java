package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Product-wise profit breakdown
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductWiseProfit {

    /**
     * Product ID
     */
    private String productId;

    /**
     * Product name (e.g., Petrol, Diesel)
     */
    private String productName;

    /**
     * Product type (should be FUEL for profit reports)
     */
    private String productType;

    /**
     * Sales revenue for this product
     */
    private BigDecimal salesRevenue;

    /**
     * Purchase cost for this product
     */
    private BigDecimal purchaseCost;

    /**
     * Profit for this product
     */
    private BigDecimal profit;

    /**
     * Quantity sold
     */
    private BigDecimal quantitySold;

    /**
     * Quantity purchased
     */
    private BigDecimal quantityPurchased;

    /**
     * Average selling price
     */
    private BigDecimal avgSellingPrice;

    /**
     * Average purchase price
     */
    private BigDecimal avgPurchasePrice;
}
