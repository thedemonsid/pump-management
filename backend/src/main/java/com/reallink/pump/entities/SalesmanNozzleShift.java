package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_salesman_nozzle_shift", indexes = {
    @Index(name = "idx_nozzle_shift", columnList = "nozzle_id"),
    @Index(name = "idx_salesman_shift", columnList = "salesman_id"),
    @Index(name = "idx_pump_master_shift", columnList = "pump_master_id"),
    @Index(name = "idx_status_shift", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesmanNozzleShift extends BaseEntity {

    public enum ShiftStatus {
        OPEN, CLOSED
    }

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_nozzle_shift_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Salesman is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_id", nullable = false, foreignKey = @ForeignKey(name = "fk_shift_salesman"))
    private User salesman;

    @NotNull(message = "Nozzle is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nozzle_id", nullable = false, foreignKey = @ForeignKey(name = "fk_shift_nozzle"))
    private Nozzle nozzle;

    @NotNull(message = "Start date time is required")
    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.0", message = "Opening balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening balance must have at most 12 digits and 3 decimal places")
    @Column(name = "opening_balance", nullable = false, precision = 15, scale = 3)
    private BigDecimal openingBalance;

    @DecimalMin(value = "0.0", message = "Closing balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing balance must have at most 12 digits and 3 decimal places")
    @Column(name = "closing_balance", precision = 15, scale = 3)
    private BigDecimal closingBalance;

    @NotNull(message = "Product price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Product price must be positive")
    @Digits(integer = 10, fraction = 2, message = "Product price must have at most 10 digits and 2 decimal places")
    @Column(name = "product_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal productPrice;

    @DecimalMin(value = "0.0", message = "Total amount cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Total amount must have at most 15 digits and 2 decimal places")
    @Column(name = "total_amount", precision = 17, scale = 2)
    private BigDecimal totalAmount;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10, columnDefinition = "VARCHAR(10) DEFAULT 'OPEN'")
    private ShiftStatus status = ShiftStatus.OPEN;

    @NotNull(message = "isAccountingDone is required")
    @Column(name = "is_accounting_done", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isAccountingDone = false;

    public SalesmanNozzleShift(User salesman, Nozzle nozzle, LocalDateTime startDateTime, BigDecimal openingBalance, BigDecimal productPrice, PumpInfoMaster pumpMaster) {
        this.salesman = salesman;
        this.nozzle = nozzle;
        this.startDateTime = startDateTime;
        this.openingBalance = openingBalance;
        this.productPrice = productPrice;
        this.pumpMaster = pumpMaster;
        this.status = ShiftStatus.OPEN;
        this.isAccountingDone = false;
    }

    // Business methods
    public boolean isShiftCompleted() {
        return ShiftStatus.CLOSED.equals(status);
    }

    public void closeShift() {
        this.status = ShiftStatus.CLOSED;
    }

    public BigDecimal getDispensedAmount() {
        if (closingBalance == null || openingBalance == null) {
            return BigDecimal.ZERO;
        }
        return closingBalance.subtract(openingBalance);
    }

    public BigDecimal calculateTotalAmount() {
        if (closingBalance == null || openingBalance == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal dispensed = closingBalance.subtract(openingBalance);
        return dispensed.multiply(productPrice != null ? productPrice : BigDecimal.ZERO);
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void updateTotalAmount() {
        this.totalAmount = calculateTotalAmount().setScale(2, RoundingMode.HALF_UP);
    }
}
