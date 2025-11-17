package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "pump_salesman_bill_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_salesman_bill_no_pump", columnNames = {"bill_no", "pump_master_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesmanBill extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_bill_pump_master"))
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
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_bill_customer"))
    private Customer customer;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_bill_product"))
    private Product product;

    @NotNull(message = "Salesman shift is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_shift_id", nullable = false, foreignKey = @ForeignKey(name = "fk_salesman_bill_shift"))
    private SalesmanShift salesmanShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nozzle_id", foreignKey = @ForeignKey(name = "fk_salesman_bill_nozzle"))
    private Nozzle nozzle;

    @NotNull(message = "Rate type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "rate_type", nullable = false)
    private RateType rateType;

    @NotNull(message = "Billing mode is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_mode", nullable = false)
    private BillingMode billingMode;

    @NotBlank(message = "Vehicle number is required")
    @Size(max = 20, message = "Vehicle number cannot exceed 20 characters")
    @Column(name = "vehicle_no", nullable = false, length = 20)
    private String vehicleNo;

    @NotBlank(message = "Driver name is required")
    @Size(max = 100, message = "Driver name cannot exceed 100 characters")
    @Column(name = "driver_name", nullable = false, length = 100)
    private String driverName;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
    @Digits(integer = 10, fraction = 3, message = "Quantity must have at most 10 digits and 3 decimal places")
    @Column(name = "quantity", nullable = false, precision = 12, scale = 3)
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
    private BigDecimal amount = BigDecimal.ZERO;

    @NotNull(message = "Net amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Net amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Net amount must have at most 10 digits and 2 decimal places")
    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meter_image_id", foreignKey = @ForeignKey(name = "fk_salesman_bill_meter_image"))
    private FileStorage meterImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_image_id", foreignKey = @ForeignKey(name = "fk_salesman_bill_vehicle_image"))
    private FileStorage vehicleImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "extra_image_id", foreignKey = @ForeignKey(name = "fk_salesman_bill_extra_image"))
    private FileStorage extraImage;
}
