package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_tank_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_tank_name_pump", columnNames = {"tank_name", "pump_master_id"}),}, indexes = {
    @Index(name = "idx_tank_name", columnList = "tank_name"),
    @Index(name = "idx_product_id", columnList = "product_id"),
    @Index(name = "idx_pump_master_id_tank", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tank extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tank_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotBlank(message = "Tank name is required")
    @Size(min = 2, max = 100, message = "Tank name must be between 2 and 100 characters")
    @Column(name = "tank_name", nullable = false, length = 100)
    private String tankName;

    @NotNull(message = "Capacity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Capacity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Capacity must have at most 10 digits and 2 decimal places")
    @Column(name = "capacity", nullable = false, precision = 12, scale = 2)
    private BigDecimal capacity;

    @DecimalMin(value = "0.0", message = "Current level cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Current level must have at most 10 digits and 2 decimal places")
    @Column(name = "current_level", precision = 12, scale = 2, columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal currentLevel = BigDecimal.ZERO;

    @NotNull(message = "Opening level is required")
    @DecimalMin(value = "0.00", message = "Opening level must be greater than or equal to 0.00")
    @Column(name = "opening_level", nullable = false, precision = 12, scale = 2)
    private BigDecimal openingLevel;

    @NotNull(message = "Opening level date is required")
    @Column(name = "opening_level_date", nullable = false)
    private LocalDate openingLevelDate;

    @DecimalMin(value = "0.0", message = "Low level alert cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Low level alert must have at most 10 digits and 2 decimal places")
    @Column(name = "low_level_alert", precision = 12, scale = 2)
    private BigDecimal lowLevelAlert;

    @Size(max = 50, message = "Tank location cannot exceed 50 characters")
    @Column(name = "tank_location", length = 50)
    private String tankLocation;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tank_product"))
    private Product product;

    @OneToMany(mappedBy = "tank", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Nozzle> nozzles = new HashSet<>();

    public Tank(String tankName, BigDecimal capacity, String tankLocation, Product product, PumpInfoMaster pumpMaster) {
        this.tankName = tankName;
        this.capacity = capacity;
        this.tankLocation = tankLocation;
        this.product = product;
        this.pumpMaster = pumpMaster;
        this.currentLevel = BigDecimal.ZERO;
        this.openingLevel = BigDecimal.ZERO;
        this.openingLevelDate = LocalDate.now();
    }

    // Business methods
    public boolean isLowLevel() {
        return lowLevelAlert != null && currentLevel != null
                && currentLevel.compareTo(lowLevelAlert) <= 0;
    }

    public BigDecimal getAvailableCapacity() {
        if (capacity == null || currentLevel == null) {
            return BigDecimal.ZERO;
        }
        return capacity.subtract(currentLevel);
    }

    public BigDecimal getFillPercentage() {
        if (capacity == null || currentLevel == null || capacity.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return currentLevel.divide(capacity, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
    }
}
