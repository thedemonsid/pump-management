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

/**
 * Represents the assignment of a nozzle to a salesman's shift. A salesman can
 * manage multiple nozzles during a shift. Each nozzle can be independently
 * opened and closed within the shift. Once a nozzle is closed, it can be
 * assigned to another salesman's shift.
 */
@Entity
@Table(name = "pump_nozzle_assignment", indexes = {
    @Index(name = "idx_nozzle_assignment_shift", columnList = "salesman_shift_id"),
    @Index(name = "idx_nozzle_assignment_nozzle", columnList = "nozzle_id"),
    @Index(name = "idx_nozzle_assignment_salesman", columnList = "salesman_id"),
    @Index(name = "idx_nozzle_assignment_status", columnList = "status"),
    @Index(name = "idx_nozzle_assignment_pump_master", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NozzleAssignment extends BaseEntity {

    public enum AssignmentStatus {
        OPEN, // Nozzle is currently being managed by salesman
        CLOSED  // Nozzle management has ended (can be reassigned)
    }

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_assignment_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Salesman shift is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_shift_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_assignment_shift"))
    private SalesmanShift salesmanShift;

    @NotNull(message = "Salesman is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_assignment_salesman"))
    private User salesman;

    @NotNull(message = "Nozzle is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nozzle_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_assignment_nozzle"))
    private Nozzle nozzle;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.0", message = "Opening balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening balance must have at most 12 digits and 3 decimal places")
    @Column(name = "opening_balance", nullable = false, precision = 15, scale = 3)
    private BigDecimal openingBalance;

    @DecimalMin(value = "0.0", message = "Closing balance cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing balance must have at most 12 digits and 3 decimal places")
    @Column(name = "closing_balance", precision = 15, scale = 3)
    private BigDecimal closingBalance;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10, columnDefinition = "VARCHAR(10) DEFAULT 'OPEN'")
    private AssignmentStatus status = AssignmentStatus.OPEN;

    // Cached calculations for performance
    @Column(name = "dispensed_amount", precision = 15, scale = 3)
    private BigDecimal dispensedAmount;

    @Column(name = "total_amount", precision = 17, scale = 2)
    private BigDecimal totalAmount;

    // Business methods
    public NozzleAssignment(SalesmanShift salesmanShift, Nozzle nozzle, User salesman,
            PumpInfoMaster pumpMaster, LocalDateTime startTime, BigDecimal openingBalance) {
        this.salesmanShift = salesmanShift;
        this.nozzle = nozzle;
        this.salesman = salesman;
        this.pumpMaster = pumpMaster;
        this.startTime = startTime;
        this.openingBalance = openingBalance;
        this.status = AssignmentStatus.OPEN;
    }

    public boolean isOpen() {
        return AssignmentStatus.OPEN.equals(status);
    }

    public boolean isClosed() {
        return AssignmentStatus.CLOSED.equals(status);
    }

    public void closeAssignment(LocalDateTime endTime, BigDecimal closingBalance) {
        if (isClosed()) {
            throw new IllegalStateException("Nozzle assignment is already closed");
        }
        if (closingBalance.compareTo(openingBalance) < 0) {
            throw new IllegalArgumentException("Closing balance cannot be less than opening balance");
        }

        this.endTime = endTime;
        this.closingBalance = closingBalance;
        this.status = AssignmentStatus.CLOSED;

        // Calculate and cache values
        this.dispensedAmount = calculateDispensedAmount();
        this.totalAmount = calculateTotalAmount();
    }

    public BigDecimal calculateDispensedAmount() {
        if (closingBalance == null || openingBalance == null) {
            return BigDecimal.ZERO;
        }
        return closingBalance.subtract(openingBalance);
    }

    public BigDecimal getDispensedAmount() {
        if (dispensedAmount != null) {
            return dispensedAmount;
        }
        return calculateDispensedAmount();
    }

    public BigDecimal calculateTotalAmount() {
        if (closingBalance == null || openingBalance == null || nozzle == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal dispensed = closingBalance.subtract(openingBalance);
        BigDecimal price = BigDecimal.ZERO;

        // Get price from nozzle's tank's product
        if (nozzle.getTank() != null && nozzle.getTank().getProduct() != null) {
            price = nozzle.getTank().getProduct().getSalesRate();
        }

        return dispensed.multiply(price != null ? price : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getTotalAmount() {
        if (totalAmount != null) {
            return totalAmount;
        }
        return calculateTotalAmount();
    }

    public void updateCalculatedFields() {
        this.dispensedAmount = calculateDispensedAmount();
        this.totalAmount = calculateTotalAmount();
    }
}
