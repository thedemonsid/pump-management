package com.reallink.pump.entities;

import java.time.LocalTime;
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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_shift", uniqueConstraints = {
    @jakarta.persistence.UniqueConstraint(name = "uk_shift_name_pump", columnNames = {"name", "pump_master_id"})
}, indexes = {
    @Index(name = "idx_shift_name", columnList = "name"),
    @Index(name = "idx_start_time", columnList = "start_time"),
    @Index(name = "idx_pump_master_id_shift", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shift extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_shift_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotBlank(message = "Shift name is required")
    @Size(min = 2, max = 50, message = "Shift name must be between 2 and 50 characters")
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @NotBlank(message = "Description cannot be blank")
    @Size(max = 200, message = "Description cannot exceed 200 characters")
    @Column(name = "description", length = 200)
    private String description;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "active", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean active = true;

    @OneToMany(mappedBy = "shift", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<SalesmanShift> salesmanShifts = new HashSet<>();

    public Shift(String name, LocalTime startTime, LocalTime endTime) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
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

    public boolean isTimeInShift(LocalTime time) {
        if (time == null) {
            return false;
        }

        // Handle overnight shifts (end time is before start time)
        if (endTime.isBefore(startTime)) {
            return time.isAfter(startTime) || time.isBefore(endTime) || time.equals(startTime);
        } else {
            return (time.isAfter(startTime) || time.equals(startTime)) && time.isBefore(endTime);
        }
    }
}
