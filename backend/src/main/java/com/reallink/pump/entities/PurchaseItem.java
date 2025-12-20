package com.reallink.pump.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_purchase_item_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseItem extends BaseEntity {

    @NotNull(message = "Purchase is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purchase_item_purchase"))
    private Purchase purchase;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purchase_item_product"))
    private Product product;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Column(name = "quantity", nullable = false, columnDefinition = "INT")
    private Integer quantity;

    @NotBlank(message = "Purchase unit is required")
    @Size(max = 20, message = "Purchase unit cannot exceed 20 characters")
    @Column(name = "purchase_unit", nullable = false, length = 20)
    private String purchaseUnit;

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

    @NotNull(message = "Tax percentage is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tax percentage must be non-negative")
    @Digits(integer = 5, fraction = 2, message = "Tax percentage must have at most 5 digits and 2 decimal places")
    @Column(name = "tax_percentage", nullable = false, precision = 7, scale = 2)
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "Tax amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Tax amount must have at most 10 digits and 2 decimal places")
    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "add_to_stock", nullable = false)
    private Boolean addToStock = false;
}
