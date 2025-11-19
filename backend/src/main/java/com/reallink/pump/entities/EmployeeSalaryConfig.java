package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.reallink.pump.enums.SalaryType;

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
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employee_salary_config", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_pump_salary_config", columnNames = {"user_id", "pump_master_id"})
}, indexes = {
    @Index(name = "idx_user_id_salary_config", columnList = "user_id"),
    @Index(name = "idx_pump_master_id_salary_config", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalaryConfig extends BaseEntity {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salary_config_user"))
    private User user;

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salary_config_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Salary type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "salary_type", nullable = false, length = 20)
    private SalaryType salaryType;

    @NotNull(message = "Basic salary amount is required")
    @DecimalMin(value = "0.01", message = "Basic salary amount must be greater than 0.00")
    @Column(name = "basic_salary_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicSalaryAmount;

    @NotNull(message = "Effective from date is required")
    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @NotNull(message = "Half day rate is required")
    @DecimalMin(value = "0.00", message = "Half day rate must be between 0.00 and 1.00")
    @Column(name = "half_day_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal halfDayRate = new BigDecimal("0.50"); // 50% of daily rate

    @NotNull(message = "Overtime rate is required")
    @DecimalMin(value = "0.00", message = "Overtime rate must be greater than or equal to 0.00")
    @Column(name = "overtime_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal overtimeRate = new BigDecimal("1.50"); // 150% of daily rate

    @Column(name = "notes", length = 500)
    private String notes;
}
