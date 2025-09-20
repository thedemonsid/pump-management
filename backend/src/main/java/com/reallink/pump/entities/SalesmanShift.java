package com.reallink.pump.entities;

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
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_salesman_shift", uniqueConstraints = @UniqueConstraint(name = "uk_salesman_shift_date", columnNames = {
    "salesman_id", "shift_id", "shift_date", "pump_master_id"}), indexes = {
    @Index(name = "idx_salesman_id", columnList = "salesman_id"),
    @Index(name = "idx_shift_id", columnList = "shift_id"),
    @Index(name = "idx_shift_date", columnList = "shift_date"),
    @Index(name = "idx_pump_master_id_salesman_shift", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesmanShift extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_shift_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Salesman is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salesman_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_shift_salesman"))
    private Salesman salesman;

    @NotNull(message = "Shift is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_shift_shift"))
    private Shift shift;

    @NotNull(message = "Shift date is required")
    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "active", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean active = true;

    @OneToMany(mappedBy = "salesmanShift", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<NozzleReading> nozzleReadings = new HashSet<>();

    public SalesmanShift(Salesman salesman, Shift shift, LocalDate shiftDate) {
        this.salesman = salesman;
        this.shift = shift;
        this.shiftDate = shiftDate;
        this.active = true;
    }

    // Business methods
    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public boolean isForToday() {
        return LocalDate.now().equals(shiftDate);
    }

    public boolean hasReadings() {
        return nozzleReadings != null && !nozzleReadings.isEmpty();
    }

    public long getOpenReadingsCount() {
        return nozzleReadings.stream()
                .filter(NozzleReading::isOpen)
                .count();
    }

    public long getClosedReadingsCount() {
        return nozzleReadings.stream()
                .filter(NozzleReading::isClosed)
                .count();
    }

    public boolean isShiftComplete() {
        return nozzleReadings.stream()
                .allMatch(NozzleReading::isClosed);
    }
}
