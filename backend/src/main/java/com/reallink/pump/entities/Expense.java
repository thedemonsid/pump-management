package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

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
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_expense", indexes = {
    @Index(name = "idx_expense_date", columnList = "expense_date"),
    @Index(name = "idx_expense_head", columnList = "expense_head_id"),
    @Index(name = "idx_expense_type", columnList = "expense_type"),
    @Index(name = "idx_expense_nozzle_shift", columnList = "salesman_nozzle_shift_id"),
    @Index(name = "idx_expense_bank_account", columnList = "bank_account_id"),
    @Index(name = "idx_pump_master_expense", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Expense extends BaseEntity {

    public enum ExpenseType {
        NOZZLE_SHIFT, // Expense associated with a nozzle shift
        BANK_ACCOUNT   // Expense associated with a bank account
    }

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_expense_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Expense head is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expense_head_id", nullable = false, foreignKey = @ForeignKey(name = "fk_expense_head"))
    private ExpenseHead expenseHead;

    @NotNull(message = "Expense type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false, length = 20)
    private ExpenseType expenseType;

    // Optional: Associated with nozzle shift (when expenseType = NOZZLE_SHIFT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salesman_nozzle_shift_id", foreignKey = @ForeignKey(name = "fk_expense_nozzle_shift"))
    private SalesmanNozzleShift salesmanNozzleShift;

    // Optional: Associated with bank account (when expenseType = BANK_ACCOUNT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", foreignKey = @ForeignKey(name = "fk_expense_bank_account"))
    private BankAccount bankAccount;

    @NotNull(message = "Expense date is required")
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 digits and 2 decimal places")
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    @Column(name = "remarks", length = 500)
    private String remarks;

    @Size(max = 100, message = "Reference number cannot exceed 100 characters")
    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    // Link to the bank transaction created for this expense (if expense type is BANK_ACCOUNT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_transaction_id", foreignKey = @ForeignKey(name = "fk_expense_bank_transaction"))
    private BankTransaction bankTransaction;

    public Expense(PumpInfoMaster pumpMaster, ExpenseHead expenseHead, ExpenseType expenseType,
            LocalDate expenseDate, BigDecimal amount, String remarks) {
        this.pumpMaster = pumpMaster;
        this.expenseHead = expenseHead;
        this.expenseType = expenseType;
        this.expenseDate = expenseDate;
        this.amount = amount;
        this.remarks = remarks;
    }

    // Business methods
    public boolean isNozzleShiftExpense() {
        return ExpenseType.NOZZLE_SHIFT.equals(expenseType);
    }

    public boolean isBankAccountExpense() {
        return ExpenseType.BANK_ACCOUNT.equals(expenseType);
    }

    public void associateWithNozzleShift(SalesmanNozzleShift shift) {
        if (!ExpenseType.NOZZLE_SHIFT.equals(this.expenseType)) {
            throw new IllegalStateException("Cannot associate nozzle shift with non-NOZZLE_SHIFT expense type");
        }
        this.salesmanNozzleShift = shift;
        this.bankAccount = null;
    }

    public void associateWithBankAccount(BankAccount account) {
        if (!ExpenseType.BANK_ACCOUNT.equals(this.expenseType)) {
            throw new IllegalStateException("Cannot associate bank account with non-BANK_ACCOUNT expense type");
        }
        this.bankAccount = account;
        this.salesmanNozzleShift = null;
    }
}
