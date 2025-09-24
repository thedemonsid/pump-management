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
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_bill_item_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillItem extends BaseEntity {

    @NotNull(message = "Bill is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bill_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bill_item_bill"))
    private Bill bill;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bill_item_product"))
    private Product product;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Digits(integer = 10, fraction = 2, message = "Quantity must have at most 10 digits and 2 decimal places")
    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @NotNull(message = "Rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be positive")
    @Digits(integer = 10, fraction = 2, message = "Rate must have at most 10 digits and 2 decimal places")
    @Column(name = "rate", nullable = false, precision = 12, scale = 2)
    private BigDecimal rate;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 digits and 2 decimal places")
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Net amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Net amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Net amount must have at most 10 digits and 2 decimal places")
    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "GST must be non-negative")
    @Digits(integer = 5, fraction = 2, message = "GST must have at most 5 digits and 2 decimal places")
    @Column(name = "gst", nullable = false, precision = 7, scale = 2)
    private BigDecimal gst = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Discount must have at most 10 digits and 2 decimal places")
    @Column(name = "discount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;
}
