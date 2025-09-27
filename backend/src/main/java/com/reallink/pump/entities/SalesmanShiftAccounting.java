package com.reallink.pump.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_salesman_shift_accounting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesmanShiftAccounting extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salesman_nozzle_shift_id", nullable = false, foreignKey = @ForeignKey(name = "fk_shift_accounting"))
    private SalesmanNozzleShift salesmanNozzleShift;
   
    private Double fuelSales;

    private Double customerReceipt;

    private Double totalSalesAmount;

    private Double upiReceived;

    private Double cardReceived;

    private Double credit;

    private Double expenses;

    private Double totalAmount;

    private Double cashInHand;

    private Double balanceAmount;

}
