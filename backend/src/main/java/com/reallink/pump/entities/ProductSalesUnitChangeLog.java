package com.reallink.pump.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity to track changes to the sales unit of products. This is especially
 * important for fuel products where unit changes need to be tracked for
 * reporting and auditing purposes.
 */
@Entity
@Table(name = "product_sales_unit_change_log", indexes = {
    @Index(name = "idx_product_id_change_log", columnList = "product_id"),
    @Index(name = "idx_pump_master_id_change_log", columnList = "pump_master_id"),
    @Index(name = "idx_change_date", columnList = "created_at"),
    @Index(name = "idx_product_type_change_log", columnList = "product_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesUnitChangeLog extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_sales_unit_log_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_sales_unit_log_product"))
    private Product product;

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name cannot exceed 100 characters")
    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @NotNull(message = "Product type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 20)
    private ProductType productType;

    @NotBlank(message = "Old sales unit is required")
    @Size(max = 20, message = "Old sales unit cannot exceed 20 characters")
    @Column(name = "old_sales_unit", nullable = false, length = 20)
    private String oldSalesUnit;

    @NotBlank(message = "New sales unit is required")
    @Size(max = 20, message = "New sales unit cannot exceed 20 characters")
    @Column(name = "new_sales_unit", nullable = false, length = 20)
    private String newSalesUnit;

    @Column(name = "old_stock_quantity", precision = 12, scale = 2)
    private BigDecimal oldStockQuantity;

    @Column(name = "new_stock_quantity", precision = 12, scale = 2)
    private BigDecimal newStockQuantity;

    @Column(name = "old_sales_rate", precision = 12, scale = 2)
    private BigDecimal oldSalesRate;

    @Column(name = "new_sales_rate", precision = 12, scale = 2)
    private BigDecimal newSalesRate;

    @Size(max = 500, message = "Change reason cannot exceed 500 characters")
    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @Size(max = 100, message = "Changed by cannot exceed 100 characters")
    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
    @Column(name = "remarks", length = 1000)
    private String remarks;

    /**
     * Constructor for creating a change log entry
     */
    public ProductSalesUnitChangeLog(Product product, String oldSalesUnit, String newSalesUnit,
            BigDecimal oldStockQuantity, BigDecimal newStockQuantity,
            BigDecimal oldSalesRate, BigDecimal newSalesRate,
            String changeReason, String changedBy) {
        this.pumpMaster = product.getPumpMaster();
        this.product = product;
        this.productName = product.getProductName();
        this.productType = product.getProductType();
        this.oldSalesUnit = oldSalesUnit;
        this.newSalesUnit = newSalesUnit;
        this.oldStockQuantity = oldStockQuantity;
        this.newStockQuantity = newStockQuantity;
        this.oldSalesRate = oldSalesRate;
        this.newSalesRate = newSalesRate;
        this.changeReason = changeReason;
        this.changedBy = changedBy;
    }
}
