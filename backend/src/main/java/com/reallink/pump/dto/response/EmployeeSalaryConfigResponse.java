package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.enums.SalaryType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSalaryConfigResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private UUID pumpMasterId;
    private SalaryType salaryType;
    private BigDecimal basicSalaryAmount;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean isActive;
    private BigDecimal halfDayRate;
    private BigDecimal overtimeRate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
