package com.reallink.pump.entities;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "pump_info_master",
        uniqueConstraints = @UniqueConstraint(columnNames = {"pump_id", "pump_code"}),
        indexes = {
            @Index(name = "idx_pump_code", columnList = "pump_code"),
            @Index(name = "idx_pump_id", columnList = "pump_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PumpInfoMaster extends BaseEntity {

    @NotNull(message = "Pump ID is required")
    @Positive(message = "Pump ID must be positive")
    @Column(name = "pump_id", nullable = false)
    private Integer pumpId;

    @NotBlank(message = "Pump code is required")
    @Column(name = "pump_code", nullable = false, length = 20)
    private String pumpCode;

    @NotBlank(message = "Pump name is required")
    @Size(min = 2, max = 100, message = "Pump name must be between 2 and 100 characters")
    @Column(name = "pump_name", nullable = false, length = 100)
    private String pumpName;

    // Relationships
    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Tank> tanks = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Product> products = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Nozzle> nozzles = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Customer> customers = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Supplier> suppliers = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Shift> shifts = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FuelPurchase> fuelPurchases = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Purchase> purchases = new HashSet<>();

    @OneToMany(mappedBy = "pumpMaster", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BankAccount> bankAccounts = new HashSet<>();

    public PumpInfoMaster(String pumpCode, Integer pumpId, String pumpName) {
        this.pumpCode = pumpCode;
        this.pumpId = pumpId;
        this.pumpName = pumpName;
    }
}
