package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_product_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_product_name_pump", columnNames = {"product_name", "pump_master_id"}),
    @UniqueConstraint(name = "uk_hsn_code_pump", columnNames = {"hsn_code", "pump_master_id"})
}, indexes = {
    @Index(name = "idx_product_name", columnList = "product_name"),
    @Index(name = "idx_hsn_code", columnList = "hsn_code"),
    @Index(name = "idx_pump_master_id_product", columnList = "pump_master_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "GST percentage is required")
    @Min(value = 0, message = "GST percentage cannot be negative")
    @Column(name = "gst_percentage", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer gstPercentage = 0;

    @NotNull(message = "Product type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'GENERAL'")
    private ProductType productType = ProductType.GENERAL;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @Size(max = 50, message = "Alias cannot exceed 50 characters")
    @Column(name = "alias", length = 50)
    private String alias;

    @Min(value = 0, message = "Low stock count cannot be negative")
    @Column(name = "low_stock_count")
    private Integer lowStockCount;

    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Purchase rate must have at most 10 digits and 2 decimal places")
    @Column(name = "purchase_rate", precision = 12, scale = 2)
    private BigDecimal purchaseRate;

    @DecimalMin(value = "0.0", inclusive = false, message = "Sales rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Sales rate must have at most 10 digits and 2 decimal places")
    @Column(name = "sales_rate", precision = 12, scale = 2)
    private BigDecimal salesRate;

    @Size(max = 20, message = "HSN code cannot exceed 20 characters")
    @Column(name = "hsn_code", length = 20)
    private String hsnCode;

    @NotBlank(message = "Sales unit is required")
    @Size(max = 20, message = "Sales unit cannot exceed 20 characters")
    @Column(name = "sales_unit", nullable = false, length = 20)
    private String salesUnit;

    @NotBlank(message = "Purchase unit is required")
    @Size(max = 20, message = "Purchase unit cannot exceed 20 characters")
    @Column(name = "purchase_unit", nullable = false, length = 20)
    private String purchaseUnit;

    @DecimalMin(value = "0.0", inclusive = false, message = "Stock conversion ratio must be positive")
    @Digits(integer = 10, fraction = 4, message = "Stock conversion ratio must have at most 10 digits and 4 decimal places")
    @Column(name = "stock_conversion_ratio", precision = 14, scale = 4)
    private BigDecimal stockConversionRatio;

    @DecimalMin(value = "0.0", inclusive = true, message = "Stock quantity must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Stock quantity must have at most 10 digits and 2 decimal places")
    @Column(name = "stock_quantity", precision = 12, scale = 2)
    private BigDecimal stockQuantity = BigDecimal.ZERO;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private Set<Tank> tanks = new HashSet<>();

    public Product(String productName, String alias, Integer lowStockCount, BigDecimal purchaseRate,
            BigDecimal salesRate, String hsnCode, String salesUnit, String purchaseUnit,
            BigDecimal stockConversionRatio, PumpInfoMaster pumpMaster, ProductType productType) {
        this.productName = productName;
        this.alias = alias;
        this.lowStockCount = lowStockCount;
        this.purchaseRate = purchaseRate;
        this.salesRate = salesRate;
        this.hsnCode = hsnCode;
        this.salesUnit = salesUnit;
        this.purchaseUnit = purchaseUnit;
        this.stockConversionRatio = stockConversionRatio;
        this.pumpMaster = pumpMaster;
        this.productType = productType != null ? productType : ProductType.GENERAL;
        this.gstPercentage = 0;
    }
}
