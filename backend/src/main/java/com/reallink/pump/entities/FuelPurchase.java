package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_fuel_purchase_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_fuel_purchase_id_pump", columnNames = {"fuel_purchase_id", "pump_master_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FuelPurchase extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_fuel_purchase_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Fuel Purchase ID is required")
    @Min(value = 1, message = "Fuel Purchase ID must be positive")
    @Column(name = "fuel_purchase_id", nullable = false)
    private Long fuelPurchaseId;

    @NotNull(message = "Purchase date is required")
    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @NotNull(message = "Supplier is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false, foreignKey = @ForeignKey(name = "fk_fuel_purchase_supplier"))
    private Supplier supplier;

    @NotBlank(message = "Invoice number is required")
    @Size(max = 50, message = "Invoice number cannot exceed 50 characters")
    @Column(name = "invoice_number", nullable = false, length = 50)
    private String invoiceNumber;

    @Column(name = "add_to_stock", nullable = false)
    private Boolean addToStock = false;

    @NotNull(message = "Tank is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tank_id", nullable = false, foreignKey = @ForeignKey(name = "fk_fuel_purchase_tank"))
    private Tank tank;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Quantity must have at most 10 digits and 2 decimal places")
    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @NotNull(message = "Purchase rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Purchase rate must have at most 10 digits and 2 decimal places")
    @Column(name = "purchase_rate", nullable = false, precision = 12, scale = 2)
    private BigDecimal purchaseRate;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be positive")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 digits and 2 decimal places")
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Size(max = 100, message = "Vehicle number cannot exceed 100 characters")
    @Column(name = "vehicle_number", length = 100)
    private String vehicleNumber;

    @Size(max = 45, message = "Driver name cannot exceed 45 characters")
    @Column(name = "driver_name", length = 45, columnDefinition = "VARCHAR(45) DEFAULT 'N/A'")
    private String driverName;

    @Size(max = 100, message = "Goods received by cannot exceed 100 characters")
    @Column(name = "goods_received_by", length = 100)
    private String goodsReceivedBy;

    @NotBlank(message = "Purchase unit is required")
    @Size(max = 20, message = "Purchase unit cannot exceed 20 characters")
    @Column(name = "purchase_unit", nullable = false, length = 20)
    private String purchaseUnit;

    @NotNull(message = "Tax percentage is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tax percentage must be non-negative")
    @Digits(integer = 5, fraction = 2, message = "Tax percentage must have at most 5 digits and 2 decimal places")
    @Column(name = "tax_percentage", nullable = false, precision = 7, scale = 2)
    private BigDecimal taxPercentage;

    @DecimalMin(value = "0.0", inclusive = true, message = "Reading km must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Reading km must have at most 10 digits and 2 decimal places")
    @Column(name = "reading_km", precision = 12, scale = 2)
    private BigDecimal readingKm;

    @NotNull(message = "Before density is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Before density must be positive")
    @Digits(integer = 5, fraction = 3, message = "Before density must have at most 5 digits and 3 decimal places")
    @Column(name = "bfr_density", nullable = false, precision = 8, scale = 3)
    private BigDecimal bfrDensity;

    @NotNull(message = "After density is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "After density must be positive")
    @Digits(integer = 5, fraction = 3, message = "After density must have at most 5 digits and 3 decimal places")
    @Column(name = "aft_density", nullable = false, precision = 8, scale = 3)
    private BigDecimal aftDensity;

    @NotNull(message = "Before DIP reading is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Before DIP reading must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Before DIP reading must have at most 10 digits and 2 decimal places")
    @Column(name = "bfr_dip_reading", nullable = false, precision = 12, scale = 2)
    private BigDecimal bfrDipReading;

    @NotNull(message = "After DIP reading is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "After DIP reading must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "After DIP reading must have at most 10 digits and 2 decimal places")
    @Column(name = "aft_dip_reading", nullable = false, precision = 12, scale = 2)
    private BigDecimal aftDipReading;
}
