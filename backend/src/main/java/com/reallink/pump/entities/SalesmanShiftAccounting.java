package com.reallink.pump.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_salesman_shift_accounting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesmanShiftAccounting extends BaseEntity {

    /**
     * The salesman shift for which this accounting record is maintained.
     * Accounting is done at the shift level, aggregating all nozzle activities.
     */
    @NotNull(message = "Salesman shift is required")
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_shift_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_shift_accounting"))
    private SalesmanShift salesmanShift;

    /**
     * Total fuel sales amount for this shift.
     */
    @DecimalMin(value = "0.0", message = "Fuel sales cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Fuel sales must have at most 15 digits and 2 decimal places")
    @Column(name = "fuel_sales", precision = 17, scale = 2)
    private BigDecimal fuelSales = BigDecimal.ZERO;

    /**
     * Amount received from customers repaying previous credit bills.
     */
    @DecimalMin(value = "0.0", message = "Customer receipt cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Customer receipt must have at most 15 digits and 2 decimal places")
    @Column(name = "customer_receipt", precision = 17, scale = 2)
    private BigDecimal customerReceipt = BigDecimal.ZERO;

    /**
     * Amount received via UPI payments during this shift.
     */
    @DecimalMin(value = "0.0", message = "UPI received cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "UPI received must have at most 15 digits and 2 decimal places")
    @Column(name = "upi_received", precision = 17, scale = 2)
    private BigDecimal upiReceived = BigDecimal.ZERO;

    /**
     * Amount received via card payments during this shift.
     */
    @DecimalMin(value = "0.0", message = "Card received cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Card received must have at most 15 digits and 2 decimal places")
    @Column(name = "card_received", precision = 17, scale = 2)
    private BigDecimal cardReceived = BigDecimal.ZERO;

    /**
     * Total value of fuel sold on credit (to be collected from customers
     * later).
     */
    @DecimalMin(value = "0.0", message = "Credit cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Credit must have at most 15 digits and 2 decimal places")
    @Column(name = "credit", precision = 17, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Expenses cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Expenses must have at most 15 digits and 2 decimal places")
    @Column(name = "expenses", precision = 17, scale = 2)
    private BigDecimal expenses = BigDecimal.ZERO;

    @Column(name = "expense_reason")
    private String expenseReason;

    /**
     * Total cash physically counted and submitted by the salesman.
     */
    @Digits(integer = 15, fraction = 2, message = "Cash in hand must have at most 15 digits and 2 decimal places")
    @Column(name = "cash_in_hand", precision = 17, scale = 2)
    private BigDecimal cashInHand;

    /**
     * Difference between the expected amount to be collected and the actual
     * amount submitted by the salesman.
     */
    @Digits(integer = 15, fraction = 2, message = "Balance amount must have at most 15 digits and 2 decimal places")
    @Column(name = "balance_amount", precision = 17, scale = 2)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Min(value = 0, message = "Number of 2000 notes cannot be negative")
    @Column(name = "notes_2000")
    private Integer notes2000 = 0;

    @Min(value = 0, message = "Number of 1000 notes cannot be negative")
    @Column(name = "notes_1000")
    private Integer notes1000 = 0;

    @Min(value = 0, message = "Number of 500 notes cannot be negative")
    @Column(name = "notes_500")
    private Integer notes500 = 0;

    @Min(value = 0, message = "Number of 200 notes cannot be negative")
    @Column(name = "notes_200")
    private Integer notes200 = 0;

    @Min(value = 0, message = "Number of 100 notes cannot be negative")
    @Column(name = "notes_100")
    private Integer notes100 = 0;

    @Min(value = 0, message = "Number of 50 notes cannot be negative")
    @Column(name = "notes_50")
    private Integer notes50 = 0;

    @Min(value = 0, message = "Number of 20 notes cannot be negative")
    @Column(name = "notes_20")
    private Integer notes20 = 0;

    @Min(value = 0, message = "Number of 10 notes cannot be negative")
    @Column(name = "notes_10")
    private Integer notes10 = 0;

    @Min(value = 0, message = "Number of 5 coins cannot be negative")
    @Column(name = "coins_5")
    private Integer coins5 = 0;

    @Min(value = 0, message = "Number of 2 coins cannot be negative")
    @Column(name = "coins_2")
    private Integer coins2 = 0;

    @Min(value = 0, message = "Number of 1 coins cannot be negative")
    @Column(name = "coins_1")
    private Integer coins1 = 0;
}
