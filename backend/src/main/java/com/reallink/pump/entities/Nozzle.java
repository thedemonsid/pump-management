package com.reallink.pump.entities;

import java.math.BigDecimal;
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
@Table(name = "pump_nozzle_master_master", uniqueConstraints = {
    @UniqueConstraint(name = "fk_nozzle_tank_pump", columnNames = {"nozzle_name", "tank_id", "pump_master_id"})
}, indexes = {
    @Index(name = "idx_nozzle_name", columnList = "nozzle_name"),
    @Index(name = "idx_tank_id", columnList = "tank_id"),
    @Index(name = "idx_pump_master_id_nozzle", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Nozzle extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotBlank(message = "Nozzle name is required")
    @Size(min = 2, max = 50, message = "Nozzle name must be between 2 and 50 characters")
    @Column(name = "nozzle_name", nullable = false, length = 50)
    private String nozzleName;

    @Size(max = 100, message = "Company name cannot exceed 100 characters")
    @Column(name = "company_name", length = 100)
    private String companyName;

    @DecimalMin(value = "0.0", message = "Current reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Current reading must have at most 12 digits and 3 decimal places")
    @Column(name = "current_reading", precision = 15, scale = 3, columnDefinition = "DECIMAL(15,3) DEFAULT 0.000")
    private BigDecimal currentReading = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Previous reading cannot be negative")
    @Digits(integer = 12, fraction = 3, message = "Previous reading must have at most 12 digits and 3 decimal places")
    @Column(name = "previous_reading", precision = 15, scale = 3, columnDefinition = "DECIMAL(15,3) DEFAULT 0.000")
    private BigDecimal previousReading = BigDecimal.ZERO;

    @Size(max = 20, message = "Status cannot exceed 20 characters")
    @Column(name = "status", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'ACTIVE'")
    private String status = "ACTIVE";

    @Size(max = 50, message = "Location cannot exceed 50 characters")
    @Column(name = "location", length = 50)
    private String location;

    @NotNull(message = "Tank is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tank_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_tank"))
    private Tank tank;

    @OneToMany(mappedBy = "nozzle", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<NozzleReading> readings = new HashSet<>();

    @OneToMany(mappedBy = "nozzle", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<NozzleShift> shifts = new HashSet<>();

    public Nozzle(String nozzleName, String companyName, Tank tank, PumpInfoMaster pumpMaster) {
        this.nozzleName = nozzleName;
        this.companyName = companyName;
        this.tank = tank;
        this.pumpMaster = pumpMaster;
        this.currentReading = BigDecimal.ZERO;
        this.previousReading = BigDecimal.ZERO;
        this.status = "ACTIVE";
    }

    // Business methods
    public BigDecimal getTotalDispensed() {
        if (currentReading == null || previousReading == null) {
            return BigDecimal.ZERO;
        }
        return currentReading.subtract(previousReading);
    }

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public void updateReading(BigDecimal newReading) {
        if (newReading != null && newReading.compareTo(BigDecimal.ZERO) >= 0) {
            this.previousReading = this.currentReading;
            this.currentReading = newReading;
        }
    }
}
