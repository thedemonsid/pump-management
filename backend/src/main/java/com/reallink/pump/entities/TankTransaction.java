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
@Table(name = "pump_tank_transaction")
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

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Amount must be positive")
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotBlank(message = "Entry by is required")
    @Size(min = 1, max = 100, message = "Entry by must be between 1 and 100 characters")
    @Column(name = "entry_by", nullable = false, length = 100)
    private String entryBy;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Size(max = 255, message = "Remarks cannot exceed 255 characters")
    @Column(name = "remarks", length = 255)
    private String remarks;

    public enum TransactionType {
        ADDITION, // Fuel added to tank
        REMOVAL   // Fuel removed from tank (e.g., for sales, transfers)
    }
}
