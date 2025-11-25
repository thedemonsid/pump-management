package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a salesman's work shift. A shift is a work period during which a
 * salesman manages one or more nozzles. All accounting is done at the shift
 * level, not per individual nozzle.
 */
@Entity
@Table(name = "pump_salesman_shift", indexes = {
    @Index(name = "idx_salesman_shift_salesman", columnList = "salesman_id"),
    @Index(name = "idx_salesman_shift_pump_master", columnList = "pump_master_id"),
    @Index(name = "idx_salesman_shift_status", columnList = "status"),
    @Index(name = "idx_salesman_shift_start_time", columnList = "start_datetime")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesmanShift extends BaseEntity {

    public enum ShiftStatus {
        OPEN, // Shift is currently active
        CLOSED  // Shift has been completed
    }

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_shift_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Salesman is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_shift_salesman"))
    private User salesman;

    @NotNull(message = "Start date time is required")
    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime")
    private LocalDateTime endDatetime;

    @NotNull(message = "Opening cash is required")
    @DecimalMin(value = "0.0", message = "Opening cash cannot be negative")
    @Digits(integer = 15, fraction = 2, message = "Opening cash must have at most 15 digits and 2 decimal places")
    @Column(name = "opening_cash", nullable = false, precision = 17, scale = 2)
    private BigDecimal openingCash = BigDecimal.ZERO;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10, columnDefinition = "VARCHAR(10) DEFAULT 'OPEN'")
    private ShiftStatus status = ShiftStatus.OPEN;

    @NotNull(message = "isAccountingDone is required")
    @Column(name = "is_accounting_done", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isAccountingDone = false;

    // Relationships
    /**
     * All nozzle assignments for this shift. A salesman can manage multiple
     * nozzles during a single shift.
     */
    @OneToMany(mappedBy = "salesmanShift", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NozzleAssignment> nozzleAssignments = new ArrayList<>();

    /**
     * Credit bills (fuel sold on credit) issued during this shift. Bills are
     * associated with the shift, not individual nozzles.
     */
    @OneToMany(mappedBy = "salesmanShift", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesmanBill> creditBills = new ArrayList<>();

    /**
     * Payments received during this shift (for previous credit bills). Payments
     * are recorded at shift level.
     */
    @OneToMany(mappedBy = "salesmanShift", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesmanBillPayment> payments = new ArrayList<>();

    /**
     * Expenses incurred during this shift. Expenses are recorded at shift
     * level.
     */
    @OneToMany(mappedBy = "salesmanShift", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Expense> expenses = new ArrayList<>();

    /**
     * Accounting record for this shift. Created when the shift is closed and
     * accounting is performed.
     */
    @OneToOne(mappedBy = "salesmanShift", cascade = CascadeType.ALL, orphanRemoval = true)
    private SalesmanShiftAccounting accounting;

    /**
     * Nozzle tests performed during this shift.
     */
    @OneToMany(mappedBy = "salesmanShift", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NozzleTest> nozzleTests = new ArrayList<>();

    // Business methods
    public SalesmanShift(User salesman, PumpInfoMaster pumpMaster, LocalDateTime startDatetime, BigDecimal openingCash) {
        this.salesman = salesman;
        this.pumpMaster = pumpMaster;
        this.startDatetime = startDatetime;
        this.openingCash = openingCash;
        this.status = ShiftStatus.OPEN;
        this.isAccountingDone = false;
    }

    public boolean isOpen() {
        return ShiftStatus.OPEN.equals(status);
    }

    public boolean isClosed() {
        return ShiftStatus.CLOSED.equals(status);
    }

    public void closeShift(LocalDateTime endDatetime) {
        if (isClosed()) {
            throw new IllegalStateException("Shift is already closed");
        }
        this.status = ShiftStatus.CLOSED;
        this.endDatetime = endDatetime;
    }

    public void markAccountingDone() {
        if (!isClosed()) {
            throw new IllegalStateException("Cannot mark accounting done for an open shift");
        }
        this.isAccountingDone = true;
    }

    public void revertAccountingDone() {
        this.isAccountingDone = false;
    }

    /**
     * Checks if all nozzles assigned to this shift have been closed.
     */
    public boolean areAllNozzlesClosed() {
        if (nozzleAssignments == null || nozzleAssignments.isEmpty()) {
            return true;
        }
        return nozzleAssignments.stream()
                .allMatch(NozzleAssignment::isClosed);
    }

    /**
     * Gets the count of currently open nozzles in this shift.
     */
    public long getOpenNozzleCount() {
        if (nozzleAssignments == null) {
            return 0;
        }
        return nozzleAssignments.stream()
                .filter(NozzleAssignment::isOpen)
                .count();
    }

    /**
     * Calculates total fuel sales from all nozzle assignments.
     */
    public BigDecimal calculateTotalFuelSales() {
        if (nozzleAssignments == null || nozzleAssignments.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return nozzleAssignments.stream()
                .map(NozzleAssignment::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates total credit given (sum of all credit bills).
     */
    public BigDecimal calculateTotalCredit() {
        if (creditBills == null || creditBills.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return creditBills.stream()
                .map(SalesmanBill::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates total payments received during this shift.
     */
    public BigDecimal calculateTotalPayments() {
        if (payments == null || payments.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return payments.stream()
                .map(SalesmanBillPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates total expenses incurred during this shift.
     */
    public BigDecimal calculateTotalExpenses() {
        if (expenses == null || expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates total test quantity for this shift across all nozzle
     * assignments.
     */
    public BigDecimal calculateTotalTestQuantity() {
        if (nozzleTests == null || nozzleTests.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return nozzleTests.stream()
                .map(NozzleTest::getTestQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
