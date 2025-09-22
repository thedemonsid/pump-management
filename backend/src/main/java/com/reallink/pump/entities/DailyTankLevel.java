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
@Table(name = "pump_daily_tank_level_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_tank_date", columnNames = {"tank_id", "date"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyTankLevel extends BaseEntity {

    @NotNull(message = "Tank is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tank_id", nullable = false, foreignKey = @ForeignKey(name = "fk_daily_tank_level_tank"))
    private Tank tank;

    @NotNull(message = "Date is required")
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @NotNull(message = "Daily net is required")
    @Column(name = "daily_net", nullable = false, precision = 12, scale = 2)
    private BigDecimal dailyNet;
}
