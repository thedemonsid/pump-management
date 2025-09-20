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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_customer_master", uniqueConstraints = {
    @UniqueConstraint(name = "uk_customer_name_pump", columnNames = {"customer_name", "pump_master_id"}),})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_customer_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @NotBlank(message = "Pincode is required")
    @Size(min = 5, max = 10, message = "Pincode must be between 5 and 10 characters")
    @Column(name = "pincode", nullable = false, length = 10)
    private String pincode;

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 characters")
    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @NotBlank(message = "GST number is required")
    @Size(min = 10, max = 20, message = "GST number must be greater than 10 and less than 20 characters")
    @Column(name = "gst_number", nullable = false, length = 20)
    private String gstNumber;

    @NotBlank(message = "PAN number is required")
    @Size(min = 10, max = 20, message = "PAN number must be greater than 10 and less than 20 characters")
    @Column(name = "pan_number", nullable = false, length = 20)
    private String panNumber;

    @NotNull(message = "Credit limit is required")
    @Column(name = "credit_limit", nullable = false)
    private Double creditLimit;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.00", message = "Opening balance must be greater than or equal to 0.00")
    @Column(name = "opening_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @NotNull(message = "Opening balance date is required")
    @Column(name = "opening_balance_date", nullable = false)
    private LocalDate openingBalanceDate = LocalDate.now();
}
