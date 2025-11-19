package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.reallink.pump.enums.SalaryType;

import jakarta.validation.constraints.DecimalMin;
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
public class UpdateEmployeeSalaryConfigRequest {

    @NotNull(message = "Salary type is required")
    private SalaryType salaryType;

    @NotNull(message = "Basic salary amount is required")
    @DecimalMin(value = "0.01", message = "Basic salary amount must be greater than 0.00")
    private BigDecimal basicSalaryAmount;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @NotNull(message = "Is active is required")
    private Boolean isActive;

    @NotNull(message = "Half day rate is required")
    @DecimalMin(value = "0.00", message = "Half day rate must be between 0.00 and 1.00")
    private BigDecimal halfDayRate;

    @NotNull(message = "Overtime rate is required")
    @DecimalMin(value = "0.00", message = "Overtime rate must be greater than or equal to 0.00")
    private BigDecimal overtimeRate;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
