package com.reallink.pump.entities;

import java.math.BigDecimal;

import jakarta.persistence.CascadeType;
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
     * Total fuel sales from all nozzles during this shift. Calculated at
     * accounting creation time and frozen.
     */
    @NotNull(message = "Fuel sales is required")
    @DecimalMin(value = "0.0", message = "Fuel sales cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Fuel sales must have at most 15 digits and 2 decimal places")
    @Column(name = "fuel_sales", nullable = false, precision = 17, scale = 2)
    private BigDecimal fuelSales = BigDecimal.ZERO;

    /**
     * Total customer receipts (bill payments) received during this shift.
     * Calculated at accounting creation time and frozen.
     */
    @NotNull(message = "Customer receipt is required")
    @DecimalMin(value = "0.0", message = "Customer receipt cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Customer receipt must have at most 15 digits and 2 decimal places")
    @Column(name = "customer_receipt", nullable = false, precision = 17, scale = 2)
    private BigDecimal customerReceipt = BigDecimal.ZERO;

    /**
     * System received amount (fuel sales + customer receipts). Calculated at
     * accounting creation time and frozen.
     */
    @NotNull(message = "System received amount is required")
    @DecimalMin(value = "0.0", message = "System received amount cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "System received amount must have at most 15 digits and 2 decimal places")
    @Column(name = "system_received_amount", nullable = false, precision = 17, scale = 2)
    private BigDecimal systemReceivedAmount = BigDecimal.ZERO;

    /**
     * Total credit given (sum of all credit bills) during this shift.
     * Calculated at accounting creation time and frozen.
     */
    @NotNull(message = "Credit is required")
    @DecimalMin(value = "0.0", message = "Credit cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Credit must have at most 15 digits and 2 decimal places")
    @Column(name = "credit", nullable = false, precision = 17, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    /**
     * Total expenses incurred during this shift. Calculated at accounting
     * creation time and frozen.
     */
    @NotNull(message = "Expenses is required")
    @DecimalMin(value = "0.0", message = "Expenses cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Expenses must have at most 15 digits and 2 decimal places")
    @Column(name = "expenses", nullable = false, precision = 17, scale = 2)
    private BigDecimal expenses = BigDecimal.ZERO;

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
     * Amount received via fleet card payments during this shift.
     */
    @DecimalMin(value = "0.0", message = "Fleet card received cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Fleet card received must have at most 15 digits and 2 decimal places")
    @Column(name = "fleet_card_received", precision = 17, scale = 2)
    private BigDecimal fleetCardReceived = BigDecimal.ZERO;

    /**
     * Opening cash given to salesman at start of shift (copied from shift).
     */
    @NotNull(message = "Opening cash is required")
    @DecimalMin(value = "0.0", message = "Opening cash cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Opening cash must have at most 15 digits and 2 decimal places")
    @Column(name = "opening_cash", nullable = false, precision = 17, scale = 2)
    private BigDecimal openingCash = BigDecimal.ZERO;

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

    /**
     * Optional reference to an advance salary payment created from the balance
     * amount. This is created when balance amount >= 50 and is automatically
     * managed by the system.
     */
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "advance_payment_id", foreignKey = @ForeignKey(name = "fk_shift_accounting_advance_payment"))
    private EmployeeSalaryPayment advancePayment;
}
