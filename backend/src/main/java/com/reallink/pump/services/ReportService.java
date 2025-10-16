package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.reallink.pump.config.PumpSecurityContextHolder;
import com.reallink.pump.repositories.BillRepository;
import com.reallink.pump.repositories.CustomerBillPaymentRepository;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.FuelPurchaseRepository;
import com.reallink.pump.repositories.SalesmanNozzleShiftRepository;
import com.reallink.pump.repositories.SupplierPaymentRepository;
import com.reallink.pump.repositories.SupplierRepository;

@Service
public class ReportService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private CustomerBillPaymentRepository customerBillPaymentRepository;

    @Autowired
    private SupplierPaymentRepository supplierPaymentRepository;

    @Autowired
    private FuelPurchaseRepository fuelPurchaseRepository;

    @Autowired
    private SalesmanNozzleShiftRepository salesmanNozzleShiftRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public Map<String, Object> getAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analytics = new HashMap<>();

        // Get pumpMasterId from security context
        UUID pumpMasterId = PumpSecurityContextHolder.getPumpMasterId();
        if (pumpMasterId == null) {
            throw new RuntimeException("Pump master ID not found in security context");
        }

        BigDecimal totalCredit = calculateTotalCredit(pumpMasterId, startDate, endDate);
        BigDecimal totalDebit = calculateTotalDebit(pumpMasterId, startDate, endDate);
        BigDecimal moneyReceived = calculateMoneyReceived(pumpMasterId, startDate, endDate);
        BigDecimal moneyPaid = calculateMoneyPaid(pumpMasterId, startDate, endDate);
        Long billsGenerated = countBillsGenerated(pumpMasterId, startDate, endDate);
        BigDecimal fuelDispensed = calculateFuelDispensed(pumpMasterId, startDate, endDate);

        Long customersWithCredit = countCustomersWithCredit(pumpMasterId, startDate, endDate);
        Long suppliersWithDebit = countSuppliersWithDebit(pumpMasterId, startDate, endDate);

        Map<String, Object> topCustomer = getTopCustomerWithCredit(pumpMasterId, startDate, endDate);
        Map<String, Object> topSupplier = getTopSupplierWithDebit(pumpMasterId, startDate, endDate);

        analytics.put("totalCredit", totalCredit);
        analytics.put("totalDebit", totalDebit);
        analytics.put("netAmount", totalCredit.subtract(totalDebit));
        analytics.put("billsGenerated", billsGenerated);
        analytics.put("moneyReceived", moneyReceived);
        analytics.put("moneyPaid", moneyPaid);
        analytics.put("fuelDispensed", fuelDispensed);
        analytics.put("customersWithCredit", customersWithCredit);
        analytics.put("suppliersWithDebit", suppliersWithDebit);
        analytics.put("topCustomer", topCustomer);
        analytics.put("topSupplier", topSupplier);

        return analytics;
    }

    private BigDecimal calculateTotalCredit(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal result = billRepository.findTotalCreditBillsInPeriod(pumpMasterId, startDate, endDate);
        return result != null ? result : BigDecimal.ZERO;
    }

    private BigDecimal calculateTotalDebit(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal result = fuelPurchaseRepository.findTotalFuelPurchasesInPeriod(pumpMasterId, startDate, endDate);
        return result != null ? result : BigDecimal.ZERO;
    }

    private BigDecimal calculateMoneyReceived(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal result = customerBillPaymentRepository.findTotalPaymentsInPeriod(pumpMasterId, startDate, endDate);
        return result != null ? result : BigDecimal.ZERO;
    }

    private BigDecimal calculateMoneyPaid(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal result = supplierPaymentRepository.findTotalPaymentsInPeriod(pumpMasterId, startDate, endDate);
        return result != null ? result : BigDecimal.ZERO;
    }

    private Long countBillsGenerated(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        Long count = billRepository.countBillsInPeriod(pumpMasterId, startDate, endDate);
        return count != null ? count : 0L;
    }

    private BigDecimal calculateFuelDispensed(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal result = salesmanNozzleShiftRepository.findTotalFuelDispensedInPeriod(pumpMasterId, startDate, endDate);
        return result != null ? result : BigDecimal.ZERO;
    }

    private Long countCustomersWithCredit(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        return customerRepository.countCustomersWithCreditInPeriod(pumpMasterId, startDate, endDate);
    }

    private Long countSuppliersWithDebit(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        return supplierRepository.countSuppliersWithDebitInPeriod(pumpMasterId, startDate, endDate);
    }

    private Map<String, Object> getTopCustomerWithCredit(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = customerRepository.findTopCustomerByCreditInPeriod(pumpMasterId, startDate, endDate);
        if (results != null && !results.isEmpty()) {
            Object[] result = results.get(0);
            Map<String, Object> topCustomer = new HashMap<>();
            topCustomer.put("name", result[0]);
            topCustomer.put("amount", result[1]);
            return topCustomer;
        }
        return null;
    }

    private Map<String, Object> getTopSupplierWithDebit(UUID pumpMasterId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = supplierRepository.findTopSupplierByDebitInPeriod(pumpMasterId, startDate, endDate);
        if (results != null && !results.isEmpty()) {
            Object[] result = results.get(0);
            Map<String, Object> topSupplier = new HashMap<>();
            topSupplier.put("name", result[0]);
            topSupplier.put("amount", result[1]);
            return topSupplier;
        }
        return null;
    }
}
