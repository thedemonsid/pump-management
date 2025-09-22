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
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "pump_nozzle_reading",
        indexes = {
            @Index(name = "idx_nozzle_id", columnList = "nozzle_id"),
            @Index(name = "idx_salesman_shift_id", columnList = "salesman_shift_id"),
            @Index(name = "idx_reading_time", columnList = "reading_time"),
            @Index(name = "idx_pump_master_id_reading", columnList = "pump_master_id"),
            @Index(name = "idx_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NozzleReading extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_reading_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Nozzle is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nozzle_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reading_nozzle"))
    private Nozzle nozzle;

    @NotNull(message = "Opening reading is required")
    @DecimalMin(value = "0.0", message = "Opening reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Opening reading must have at most 12 digits and 3 decimal places")
    @Column(name = "opening_reading", nullable = false, precision = 15, scale = 3)
    private BigDecimal openingReading;

    @DecimalMin(value = "0.0", message = "Closing reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Closing reading must have at most 12 digits and 3 decimal places")
    @Column(name = "closing_reading", precision = 15, scale = 3)
    private BigDecimal closingReading;

    @DecimalMin(value = "0.0", message = "Volume dispensed cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Volume dispensed must have at most 12 digits and 3 decimal places")
    @Column(name = "volume_dispensed", precision = 15, scale = 3)
    private BigDecimal volumeDispensed;

    @DecimalMin(value = "0.0", message = "Amount collected cannot be negative")
    @Digits(integer = 12, fraction = 2, message = "Amount collected must have at most 12 digits and 2 decimal places")
    @Column(name = "amount_collected", precision = 14, scale = 2)
    private BigDecimal amountCollected;

    @NotNull(message = "Reading time is required")
    @Column(name = "reading_time", nullable = false)
    private LocalDateTime readingTime;

    @NotNull(message = "Status is required")
    @Size(max = 20, message = "Status cannot exceed 20 characters")
    @Column(name = "status", nullable = false, length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'OPEN'")
    private String status = "OPEN"; // OPEN, CLOSED

    // Business methods
    public void closeReading(BigDecimal closingReading) {
        if (closingReading != null && closingReading.compareTo(this.openingReading) >= 0) {
            this.closingReading = closingReading;
            this.volumeDispensed = closingReading.subtract(this.openingReading);
            this.status = "CLOSED";
        }
    }

    public boolean isOpen() {
        return "OPEN".equals(status);
    }

    public boolean isClosed() {
        return "CLOSED".equals(status);
    }

    public BigDecimal getCurrentReading() {
        return closingReading != null ? closingReading : openingReading;
    }

    public void calculateAmountCollected(BigDecimal pricePerUnit) {
        if (volumeDispensed != null && pricePerUnit != null) {
            this.amountCollected = volumeDispensed.multiply(pricePerUnit);
        }
    }

    public boolean isValidReading() {
        return openingReading != null
                && (closingReading == null || closingReading.compareTo(openingReading) >= 0);
    }
}
