package com.reallink.pump.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_expense_head_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_expense_head_name_pump", columnNames = {"head_name", "pump_master_id"})
}, indexes = {
    @Index(name = "idx_expense_head_name", columnList = "head_name"),
    @Index(name = "idx_pump_master_expense_head", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseHead extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_expense_head_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotBlank(message = "Expense head name is required")
    @Size(min = 2, max = 100, message = "Expense head name must be between 2 and 100 characters")
    @Column(name = "head_name", nullable = false, length = 100)
    private String headName;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Column(name = "description", length = 255)
    private String description;

    @NotNull(message = "Active status is required")
    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    public ExpenseHead(PumpInfoMaster pumpMaster, String headName, String description) {
        this.pumpMaster = pumpMaster;
        this.headName = headName;
        this.description = description;
        this.isActive = true;
    }
}
