package com.reallink.pump.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_tank_transaction_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TankTransaction extends BaseEntity {

    @NotNull(message = "Tank is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tank_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tank_transaction_tank"))
    private Tank tank;

    @NotNull(message = "Transaction type is required")
    @Column(name = "transaction_type", nullable = false, length = 10)
    private TransactionType transactionType;

    @NotNull(message = "Volume is required")
    @DecimalMin(value = "0.01", message = "Volume must be greater than 0.00")
    @Column(name = "volume", nullable = false, precision = 12, scale = 2)
    private BigDecimal volume;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters")
    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @NotNull(message = "Transaction date is required")
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Size(max = 100, message = "Supplier name cannot exceed 100 characters")
    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    @Size(max = 50, message = "Invoice number cannot exceed 50 characters")
    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    public enum TransactionType {
        ADDITION, // Fuel added to tank
        REMOVAL   // Fuel removed from tank (e.g., for sales, transfers)
    }
}