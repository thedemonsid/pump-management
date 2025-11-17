package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity representing dip readings for fuel tanks. Tracks physical measurements
 * and calculated fuel levels.
 */
@Entity
@Table(name = "pump_dip_reading", indexes = {
    @Index(name = "idx_dip_reading_tank", columnList = "tank_id"),
    @Index(name = "idx_dip_reading_timestamp", columnList = "reading_timestamp"),
    @Index(name = "idx_dip_reading_tank_timestamp", columnList = "tank_id, reading_timestamp"),
    @Index(name = "idx_dip_reading_pump_master", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DipReading extends BaseEntity {

    @NotNull(message = "Tank is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tank_id", nullable = false, foreignKey = @ForeignKey(name = "fk_dip_reading_tank"))
    private Tank tank;

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_dip_reading_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Reading timestamp is required")
    @Column(name = "reading_timestamp", nullable = false)
    private LocalDateTime readingTimestamp;

    @DecimalMin(value = "0.00", message = "Dip level must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Dip level must have at most 10 digits and 2 decimal places")
    @Column(name = "dip_level", precision = 12, scale = 2)
    private BigDecimal dipLevel;

    @DecimalMin(value = "0.00", message = "Density must be non-negative")
    @Digits(integer = 5, fraction = 4, message = "Density must have at most 5 digits and 4 decimal places")
    @Column(name = "density", precision = 9, scale = 4)
    private BigDecimal density;

    @Digits(integer = 5, fraction = 2, message = "Temperature must have at most 5 digits and 2 decimal places")
    @Column(name = "temperature", precision = 7, scale = 2)
    private BigDecimal temperature;

    @DecimalMin(value = "0.00", message = "Fuel level in litres must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Fuel level litres must have at most 10 digits and 2 decimal places")
    @Column(name = "fuel_level_litres", precision = 12, scale = 2)
    private BigDecimal fuelLevelLitres;

    @DecimalMin(value = "0.00", message = "System fuel level must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "System fuel level must have at most 10 digits and 2 decimal places")
    @Column(name = "fuel_level_system", precision = 12, scale = 2)
    private BigDecimal fuelLevelSystem;

    @Column(name = "variance", precision = 12, scale = 2)
    private BigDecimal variance;

    @Column(name = "remarks", length = 500)
    private String remarks;
}
