package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employee_salary_payment", uniqueConstraints = {
    @UniqueConstraint(name = "uk_salary_payment_reference_bank_transaction", columnNames = {"reference_number", "bank_transaction_id"})
}, indexes = {
    @Index(name = "idx_user_id_salary_payment", columnList = "user_id"),
    @Index(name = "idx_pump_master_id_salary_payment", columnList = "pump_master_id"),
    @Index(name = "idx_calculated_salary_id", columnList = "calculated_salary_id"),
    @Index(name = "idx_bank_account_id_salary_payment", columnList = "bank_account_id"),
    @Index(name = "idx_salary_payment_date", columnList = "payment_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalaryPayment extends BaseEntity {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salary_payment_user"))
    private User user;

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salary_payment_pump_master"))
    private PumpInfoMaster pumpMaster;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "calculated_salary_id", nullable = true, foreignKey = @ForeignKey(name = "fk_salary_payment_calculated_salary"))
    private CalculatedSalary calculatedSalary;

    @NotNull(message = "Bank account is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_account_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salary_payment_bank_account"))
    private BankAccount bankAccount;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @NotNull(message = "Payment method is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Reference number is required")
    @Size(min = 1, max = 50, message = "Reference number must be between 1 and 50 characters")
    @Column(name = "reference_number", nullable = false, length = 50)
    private String referenceNumber;

    @Size(max = 500, message = "Notes must be less than 500 characters")
    @Column(name = "notes", length = 500)
    private String notes;

    @NotNull(message = "Bank transaction is required")
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, optional = false)
    @JoinColumn(name = "bank_transaction_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salary_payment_bank_transaction"))
    private BankTransaction bankTransaction;
}
