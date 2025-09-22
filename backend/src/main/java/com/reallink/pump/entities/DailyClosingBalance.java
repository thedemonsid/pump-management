package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_daily_closing_balance_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_bank_account_date", columnNames = {"bank_account_id", "date"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyClosingBalance extends BaseEntity {

    @NotNull(message = "Bank account is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_account_id", nullable = false, foreignKey = @ForeignKey(name = "fk_daily_closing_balance_bank_account"))
    private BankAccount bankAccount;

    @NotNull(message = "Date is required")
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @NotNull(message = "Daily net is required")
    @Column(name = "daily_net", nullable = false, precision = 15, scale = 2)
    private BigDecimal dailyNet;
}
