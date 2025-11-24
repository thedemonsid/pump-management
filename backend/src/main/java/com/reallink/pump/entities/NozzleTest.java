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

/**
 * Represents a nozzle test reading performed by a salesman during a shift. When
 * testing nozzles, salesmen dispense a small amount of fuel (e.g., 5 liters) to
 * verify accuracy, then return it to the tank. This test quantity appears on
 * the meter but should not be counted in sales accounting.
 *
 * Simplified design: Only stores essential relationships - shift, assignment,
 * and pump. Nozzle and salesman data is accessible through these relationships.
 */
@Entity
@Table(name = "pump_nozzle_test", indexes = {
    @Index(name = "idx_nozzle_test_shift", columnList = "salesman_shift_id"),
    @Index(name = "idx_nozzle_test_assignment", columnList = "nozzle_assignment_id"),
    @Index(name = "idx_nozzle_test_pump_master", columnList = "pump_master_id"),
    @Index(name = "idx_nozzle_test_datetime", columnList = "test_datetime")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NozzleTest extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_test_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Salesman shift is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_shift_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_test_shift"))
    private SalesmanShift salesmanShift;

    @NotNull(message = "Nozzle assignment is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nozzle_assignment_id", nullable = false, foreignKey = @ForeignKey(name = "fk_nozzle_test_assignment"))
    private NozzleAssignment nozzleAssignment;

    @NotNull(message = "Test datetime is required")
    @Column(name = "test_datetime", nullable = false)
    private LocalDateTime testDatetime;

    @NotNull(message = "Test quantity is required")
    @DecimalMin(value = "0.001", message = "Test quantity must be at least 0.001")
    @Digits(integer = 12, fraction = 3, message = "Test quantity must have at most 12 digits and 3 decimal places")
    @Column(name = "test_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal testQuantity;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    @Column(name = "remarks", length = 500)
    private String remarks;

    // Convenience methods to access related data through relationships
    public Nozzle getNozzle() {
        return nozzleAssignment != null ? nozzleAssignment.getNozzle() : null;
    }

    public User getSalesman() {
        return salesmanShift != null ? salesmanShift.getSalesman() : null;
    }
}
