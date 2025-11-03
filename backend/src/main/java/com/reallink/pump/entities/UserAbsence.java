package com.reallink.pump.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_absence", indexes = {
    @Index(name = "idx_user_id_absence", columnList = "user_id"),
    @Index(name = "idx_pump_master_id_absence", columnList = "pump_master_id"),
    @Index(name = "idx_absence_date", columnList = "absence_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAbsence extends BaseEntity {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_absence_user"))
    private User user;

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_absence_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Absence date is required")
    @Column(name = "absence_date", nullable = false)
    private LocalDate absenceDate;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    @Column(name = "reason", length = 500)
    private String reason;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;

    @Column(name = "approved_by")
    private String approvedBy;
}
