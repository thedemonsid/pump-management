package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

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

@Entity
@Table(name = "pump_nozzle_shift_master", indexes = {
    @Index(name = "idx_nozzle_shift_date", columnList = "shift_date"),
    @Index(name = "idx_nozzle_shift_nozzle", columnList = "nozzle_id"),
    @Index(name = "idx_nozzle_shift_salesman", columnList = "salesman_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NozzleShift extends BaseEntity {

    @NotNull(message = "Shift date is required")
    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;

    @NotNull(message = "Nozzle is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nozzle_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_shift_nozzle"))
    private Nozzle nozzle;

    @NotNull(message = "Salesman is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_shift_salesman"))
    private Salesman salesman;

    @DecimalMin(value = "0.0", message = "Opening reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening reading must have at most 12 digits and 3 decimal places")
    @Column(name = "opening_reading", precision = 15, scale = 3)
    private BigDecimal openingReading;

    @DecimalMin(value = "0.0", message = "Closing reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing reading must have at most 12 digits and 3 decimal places")
    @Column(name = "closing_reading", precision = 15, scale = 3)
    private BigDecimal closingReading;

    @DecimalMin(value = "0.0", message = "Fuel price cannot be negative")
    @Digits(integer = 8, fraction = 2, message = "Fuel price must have at most 8 digits and 2 decimal places")
    @Column(name = "fuel_price", precision = 10, scale = 2)
    private BigDecimal fuelPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "next_salesman_id", foreignKey = @ForeignKey(name = "fk_nozzle_shift_next_salesman"))
    private Salesman nextSalesman;

    // Business methods
    public BigDecimal getDispensedAmount() {
        if (openingReading == null || closingReading == null) {
            return BigDecimal.ZERO;
        }
        return closingReading.subtract(openingReading);
    }

    public BigDecimal getTotalValue() {
        BigDecimal dispensed = getDispensedAmount();
        if (fuelPrice == null) {
            return BigDecimal.ZERO;
        }
        return dispensed.multiply(fuelPrice);
    }

    public boolean isClosed() {
        return closingTime != null;
    }
}
