package com.reallink.pump.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.CustomerBillPayment;

@Repository
public interface CustomerBillPaymentRepository extends JpaRepository<CustomerBillPayment, UUID> {

    List<CustomerBillPayment> findByPumpMaster_Id(UUID pumpMasterId);

    List<CustomerBillPayment> findByBill_Id(UUID billId);

    List<CustomerBillPayment> findByCustomer_Id(UUID customerId);

    List<CustomerBillPayment> findByBankAccount_Id(UUID bankAccountId);

    List<CustomerBillPayment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT p FROM CustomerBillPayment p WHERE p.pumpMaster.id = :pumpMasterId ORDER BY p.paymentDate DESC")
    List<CustomerBillPayment> findByPumpMasterIdOrderByPaymentDateDesc(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT SUM(p.amount) FROM CustomerBillPayment p WHERE p.bill.id = :billId AND p.bill IS NOT NULL")
    java.math.BigDecimal getTotalPaidAmountByBillId(@Param("billId") UUID billId);

    @Query("SELECT p FROM CustomerBillPayment p WHERE p.pumpMaster.id = :pumpMasterId AND p.bill IS NULL ORDER BY p.paymentDate DESC")
    List<CustomerBillPayment> findGeneralPaymentsByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
