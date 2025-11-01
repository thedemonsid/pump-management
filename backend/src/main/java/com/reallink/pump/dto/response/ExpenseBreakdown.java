package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Expense breakdown by category
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseBreakdown {

    /**
     * Expense head ID
     */
    private String expenseHeadId;

    /**
     * Expense head name
     */
    private String expenseHeadName;

    /**
     * Total expense amount
     */
    private BigDecimal amount;

    /**
     * Number of expense entries
     */
    private Long count;
}
