package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CalculatedSalaryResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private UUID pumpMasterId;
    private UUID salaryConfigId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private LocalDate calculationDate;
    private Integer totalDays;
    private Integer fullDayAbsences;
    private Integer halfDayAbsences;
    private Integer overtimeDays;
    private BigDecimal workingDays;
    private BigDecimal basicSalaryAmount;
    private BigDecimal overtimeAmount;
    private BigDecimal additionalPayment;
    private BigDecimal additionalDeduction;
    private BigDecimal grossSalary;
    private BigDecimal netSalary;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
