package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_bill_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_bill_no_pump", columnNames = {"bill_no", "pump_master_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bill extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bill_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotNull(message = "Bill number is required")
    @Min(value = 1, message = "Bill number must be positive")
    @Column(name = "bill_no", nullable = false)
    private Long billNo;

    @NotNull(message = "Bill date is required")
    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @NotNull(message = "Customer is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bill_customer"))
    private Customer customer;

    @NotNull(message = "Bill type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "bill_type", nullable = false)
    private BillType billType;

    @NotNull(message = "Rate type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "rate_type", nullable = false)
    private RateType rateType;

    @NotNull(message = "Payment type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Total amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Total amount must have at most 10 digits and 2 decimal places")
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Discount amount must have at most 10 digits and 2 decimal places")
    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "Tax amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Tax amount must have at most 10 digits and 2 decimal places")
    @Column(name = "tax_amount", precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @NotNull(message = "Net amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Net amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Net amount must have at most 10 digits and 2 decimal places")
    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Column(name = "vehicle_no")
    private String vehicleNo;

    @Column(name = "driver_name")
    private String driverName;

    @OneToMany(mappedBy = "bill", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BillItem> billItems = new HashSet<>();

    @OneToMany(mappedBy = "bill", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CustomerBillPayment> customerBillPayments = new HashSet<>();
}
