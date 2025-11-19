package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "calculated_salary", indexes = {
    @Index(name = "idx_user_id_calculated_salary", columnList = "user_id"),
    @Index(name = "idx_pump_master_id_calculated_salary", columnList = "pump_master_id"),
    @Index(name = "idx_salary_config_id", columnList = "salary_config_id"),
    @Index(name = "idx_salary_from_date", columnList = "from_date"),
    @Index(name = "idx_salary_to_date", columnList = "to_date"),
    @Index(name = "idx_salary_calculation_date", columnList = "calculation_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CalculatedSalary extends BaseEntity {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_calculated_salary_user"))
    private User user;

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_calculated_salary_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Salary configuration is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salary_config_id", nullable = false, foreignKey = @ForeignKey(name = "fk_calculated_salary_config"))
    private EmployeeSalaryConfig salaryConfig;

    @NotNull(message = "From date is required")
    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @NotNull(message = "To date is required")
    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @NotNull(message = "Calculation date is required")
    @Column(name = "calculation_date", nullable = false)
    private LocalDate calculationDate;

    @NotNull(message = "Total days is required")
    @Min(value = 0, message = "Total days must be greater than or equal to 0")
    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @NotNull(message = "Full day absences is required")
    @Min(value = 0, message = "Full day absences must be greater than or equal to 0")
    @Column(name = "full_day_absences", nullable = false)
    private Integer fullDayAbsences = 0;

    @NotNull(message = "Half day absences is required")
    @Min(value = 0, message = "Half day absences must be greater than or equal to 0")
    @Column(name = "half_day_absences", nullable = false)
    private Integer halfDayAbsences = 0;

    @NotNull(message = "Overtime days is required")
    @Min(value = 0, message = "Overtime days must be greater than or equal to 0")
    @Column(name = "overtime_days", nullable = false)
    private Integer overtimeDays = 0;

    @NotNull(message = "Working days is required")
    @DecimalMin(value = "0.00", message = "Working days must be greater than or equal to 0.00")
    @Column(name = "working_days", nullable = false, precision = 10, scale = 2)
    private BigDecimal workingDays;

    @NotNull(message = "Basic salary amount is required")
    @DecimalMin(value = "0.00", message = "Basic salary amount must be greater than or equal to 0.00")
    @Column(name = "basic_salary_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicSalaryAmount;

    @NotNull(message = "Overtime amount is required")
    @DecimalMin(value = "0.00", message = "Overtime amount must be greater than or equal to 0.00")
    @Column(name = "overtime_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal overtimeAmount = BigDecimal.ZERO;

    @NotNull(message = "Additional payment is required")
    @DecimalMin(value = "0.00", message = "Additional payment must be greater than or equal to 0.00")
    @Column(name = "additional_payment", nullable = false, precision = 15, scale = 2)
    private BigDecimal additionalPayment = BigDecimal.ZERO;

    @NotNull(message = "Additional deduction is required")
    @DecimalMin(value = "0.00", message = "Additional deduction must be greater than or equal to 0.00")
    @Column(name = "additional_deduction", nullable = false, precision = 15, scale = 2)
    private BigDecimal additionalDeduction = BigDecimal.ZERO;

    @NotNull(message = "Gross salary is required")
    @DecimalMin(value = "0.00", message = "Gross salary must be greater than or equal to 0.00")
    @Column(name = "gross_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossSalary;

    @NotNull(message = "Net salary is required")
    @DecimalMin(value = "0.00", message = "Net salary must be greater than or equal to 0.00")
    @Column(name = "net_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal netSalary;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Column(name = "notes", length = 1000)
    private String notes;
}
