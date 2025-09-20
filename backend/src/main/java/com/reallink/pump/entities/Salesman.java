package com.reallink.pump.entities;

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
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_salesman", uniqueConstraints = {
    @UniqueConstraint(name = "uk_contact_number_pump", columnNames = {"contact_number", "pump_master_id"}),
    @UniqueConstraint(name = "uk_employee_id_pump", columnNames = {"employee_id", "pump_master_id"})
}, indexes = {
    @Index(name = "idx_employee_id", columnList = "employee_id"),
    @Index(name = "idx_salesman_name", columnList = "name"),
    @Index(name = "idx_pump_master_id_salesman", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Salesman extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotBlank(message = "Salesman name is required")
    @Size(min = 2, max = 100, message = "Salesman name must be between 2 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Employee ID is required")
    @Size(min = 2, max = 50, message = "Employee ID must be between 2 and 50 characters")
    @Column(name = "employee_id", nullable = false, length = 50, unique = true)
    private String employeeId;

    @Size(max = 15, message = "Contact number cannot exceed 15 characters")
    @Column(name = "contact_number", length = 15)
    private String contactNumber;

    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    @Column(name = "email", length = 100)
    private String email;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    @Column(name = "address", length = 255)
    private String address;

    @Size(max = 20, message = "Aadhar card number cannot exceed 20 characters")
    @Column(name = "aadhar_card_number", length = 20)
    private String aadharCardNumber;

    @Size(max = 20, message = "PAN card number cannot exceed 20 characters")
    @Column(name = "pan_card_number", length = 20)
    private String panCardNumber;

    @Column(name = "active", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean active = true;

    @OneToMany(mappedBy = "salesman", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<SalesmanShift> shifts = new HashSet<>();

    @OneToMany(mappedBy = "salesman", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<NozzleShift> nozzleShifts = new HashSet<>();

    public Salesman(String name, String employeeId) {
        this.name = name;
        this.employeeId = employeeId;
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

    public String getCode() {
        return employeeId;
    }
}
