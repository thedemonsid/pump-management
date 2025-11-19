package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCalculatedSalaryRequest {

    @NotNull(message = "From date is required")
    private LocalDate fromDate;

    @NotNull(message = "To date is required")
    private LocalDate toDate;

    @NotNull(message = "Calculation date is required")
    private LocalDate calculationDate;

    @NotNull(message = "Total days is required")
    @Min(value = 0, message = "Total days must be greater than or equal to 0")
    private Integer totalDays;

    @NotNull(message = "Full day absences is required")
    @Min(value = 0, message = "Full day absences must be greater than or equal to 0")
    private Integer fullDayAbsences;

    @NotNull(message = "Half day absences is required")
    @Min(value = 0, message = "Half day absences must be greater than or equal to 0")
    private Integer halfDayAbsences;

    @NotNull(message = "Overtime days is required")
    @Min(value = 0, message = "Overtime days must be greater than or equal to 0")
    private Integer overtimeDays;

    @NotNull(message = "Working days is required")
    @DecimalMin(value = "0.00", message = "Working days must be greater than or equal to 0.00")
    private BigDecimal workingDays;

    @NotNull(message = "Basic salary amount is required")
    @DecimalMin(value = "0.00", message = "Basic salary amount must be greater than or equal to 0.00")
    private BigDecimal basicSalaryAmount;

    @NotNull(message = "Overtime amount is required")
    @DecimalMin(value = "0.00", message = "Overtime amount must be greater than or equal to 0.00")
    private BigDecimal overtimeAmount;

    @NotNull(message = "Additional payment is required")
    @DecimalMin(value = "0.00", message = "Additional payment must be greater than or equal to 0.00")
    private BigDecimal additionalPayment;

    @NotNull(message = "Additional deduction is required")
    @DecimalMin(value = "0.00", message = "Additional deduction must be greater than or equal to 0.00")
    private BigDecimal additionalDeduction;

    @NotNull(message = "Gross salary is required")
    @DecimalMin(value = "0.00", message = "Gross salary must be greater than or equal to 0.00")
    private BigDecimal grossSalary;

    @NotNull(message = "Net salary is required")
    @DecimalMin(value = "0.00", message = "Net salary must be greater than or equal to 0.00")
    private BigDecimal netSalary;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
