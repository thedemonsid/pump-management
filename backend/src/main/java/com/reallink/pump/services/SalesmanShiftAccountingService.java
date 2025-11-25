package com.reallink.pump.services;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.shift.CreateShiftAccountingRequest;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.entities.SalesmanShiftAccounting;
import com.reallink.pump.repositories.SalesmanShiftAccountingRepository;
import com.reallink.pump.repositories.SalesmanShiftRepository;
import com.reallink.pump.security.SecurityHelper;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing shift accounting.
 */
@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class SalesmanShiftAccountingService {

    private final SalesmanShiftRepository salesmanShiftRepository;
    private final SalesmanShiftAccountingRepository accountingRepository;
    private final SecurityHelper securityHelper;

    /**
     * Create accounting record for a shift. Only MANAGER and ADMIN can create
     * accounting.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN','SALESMAN')")
    public SalesmanShiftAccounting createAccounting(UUID shiftId, CreateShiftAccountingRequest request) {
        // Get shift
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found"));

        // Verify shift is closed
        if (!shift.isClosed()) {
            throw new IllegalStateException("Cannot create accounting for an open shift. Please close the shift first.");
        }

        // Check if accounting already exists
        if (accountingRepository.existsBySalesmanShiftId(shiftId)) {
            throw new IllegalStateException("Accounting already exists for this shift");
        }

        // Calculate totals
        BigDecimal totalFuelSales = shift.calculateTotalFuelSales();
        BigDecimal totalCredit = shift.calculateTotalCredit();
        BigDecimal totalPayments = shift.calculateTotalPayments();
        BigDecimal totalExpenses = shift.calculateTotalExpenses();
        BigDecimal systemReceivedAmount = totalFuelSales.add(totalPayments);

        // Calculate cash in hand from denominations
        BigDecimal cashInHand = calculateCashFromDenominations(request);

        // Calculate expected cash
        // Expected = Opening Cash + Fuel Sales + Payments - Credit - Expenses - UPI - Card - Fleet Card
        BigDecimal expectedCash = shift.getOpeningCash()
                .add(totalFuelSales)
                .add(totalPayments)
                .subtract(totalCredit)
                .subtract(totalExpenses)
                .subtract(request.getUpiReceived())
                .subtract(request.getCardReceived())
                .subtract(request.getFleetCardReceived());

        // Calculate balance (difference between actual and expected)
        BigDecimal balanceAmount = cashInHand.subtract(expectedCash);

        // Create accounting record
        SalesmanShiftAccounting accounting = new SalesmanShiftAccounting();
        accounting.setSalesmanShift(shift);

        // Save calculated values (frozen snapshot)
        accounting.setFuelSales(totalFuelSales);
        accounting.setCustomerReceipt(totalPayments);
        accounting.setSystemReceivedAmount(systemReceivedAmount);
        accounting.setCredit(totalCredit);
        accounting.setExpenses(totalExpenses);
        accounting.setOpeningCash(shift.getOpeningCash());

        // Save user inputs
        accounting.setUpiReceived(request.getUpiReceived());
        accounting.setCardReceived(request.getCardReceived());
        accounting.setFleetCardReceived(request.getFleetCardReceived());
        accounting.setCashInHand(cashInHand);
        accounting.setBalanceAmount(balanceAmount);

        // Set denominations
        accounting.setNotes500(request.getNotes500());
        accounting.setNotes200(request.getNotes200());
        accounting.setNotes100(request.getNotes100());
        accounting.setNotes50(request.getNotes50());
        accounting.setNotes20(request.getNotes20());
        accounting.setNotes10(request.getNotes10());
        accounting.setCoins5(request.getCoins5());
        accounting.setCoins2(request.getCoins2());
        accounting.setCoins1(request.getCoins1());

        accounting.setEntryBy(securityHelper.getCurrentUsername());

        SalesmanShiftAccounting saved = accountingRepository.save(accounting);

        // Mark shift as accounting done
        shift.markAccountingDone();
        salesmanShiftRepository.save(shift);

        log.info("Created accounting for shift {}. Balance: {}", shiftId, balanceAmount);

        return saved;
    }

    /**
     * Get accounting for a shift.
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public SalesmanShiftAccounting getAccounting(UUID shiftId) {
        // Verify access to shift
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found"));

        securityHelper.verifyAccessToSalesmanData(shift.getSalesman().getId());

        return accountingRepository.findBySalesmanShiftId(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Accounting not found for this shift"));
    }

    /**
     * Update accounting for a shift. Only MANAGER and ADMIN can update.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public SalesmanShiftAccounting updateAccounting(UUID shiftId, CreateShiftAccountingRequest request) {
        SalesmanShiftAccounting accounting = accountingRepository.findBySalesmanShiftId(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Accounting not found for this shift"));

        SalesmanShift shift = accounting.getSalesmanShift();

        // Recalculate totals (in case data changed)
        BigDecimal totalFuelSales = shift.calculateTotalFuelSales();
        BigDecimal totalCredit = shift.calculateTotalCredit();
        BigDecimal totalPayments = shift.calculateTotalPayments();
        BigDecimal totalExpenses = shift.calculateTotalExpenses();
        BigDecimal systemReceivedAmount = totalFuelSales.add(totalPayments);

        // Recalculate cash in hand
        BigDecimal cashInHand = calculateCashFromDenominations(request);

        // Recalculate expected cash
        BigDecimal expectedCash = shift.getOpeningCash()
                .add(totalFuelSales)
                .add(totalPayments)
                .subtract(totalCredit)
                .subtract(totalExpenses)
                .subtract(request.getUpiReceived())
                .subtract(request.getCardReceived())
                .subtract(request.getFleetCardReceived());

        BigDecimal balanceAmount = cashInHand.subtract(expectedCash);

        // Update calculated values
        accounting.setFuelSales(totalFuelSales);
        accounting.setCustomerReceipt(totalPayments);
        accounting.setSystemReceivedAmount(systemReceivedAmount);
        accounting.setCredit(totalCredit);
        accounting.setExpenses(totalExpenses);
        accounting.setOpeningCash(shift.getOpeningCash());

        // Update user input fields
        accounting.setUpiReceived(request.getUpiReceived());
        accounting.setCardReceived(request.getCardReceived());
        accounting.setFleetCardReceived(request.getFleetCardReceived());
        accounting.setCashInHand(cashInHand);
        accounting.setBalanceAmount(balanceAmount);

        // Update denominations
        accounting.setNotes500(request.getNotes500());
        accounting.setNotes200(request.getNotes200());
        accounting.setNotes100(request.getNotes100());
        accounting.setNotes50(request.getNotes50());
        accounting.setNotes20(request.getNotes20());
        accounting.setNotes10(request.getNotes10());
        accounting.setCoins5(request.getCoins5());
        accounting.setCoins2(request.getCoins2());
        accounting.setCoins1(request.getCoins1());

        SalesmanShiftAccounting saved = accountingRepository.save(accounting);

        log.info("Updated accounting for shift {}. New balance: {}", shiftId, balanceAmount);

        return saved;
    }

    /**
     * Delete accounting for a shift. Only MANAGER and ADMIN can delete.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public void deleteAccounting(UUID shiftId) {
        SalesmanShiftAccounting accounting = accountingRepository.findBySalesmanShiftId(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Accounting not found for this shift"));

        SalesmanShift shift = accounting.getSalesmanShift();

        // Clear the bidirectional relationship first
        shift.setAccounting(null);

        // Revert shift accounting status
        shift.revertAccountingDone();

        // Save shift to update the relationship and status
        salesmanShiftRepository.save(shift);

        // Now delete the accounting record (orphan removal will handle this, but we do it explicitly)
        accountingRepository.delete(accounting);

        log.info("Deleted accounting for shift {} by {}", shiftId, securityHelper.getCurrentUsername());
    }

    /**
     * Calculate total cash from denomination counts.
     */
    private BigDecimal calculateCashFromDenominations(CreateShiftAccountingRequest request) {
        return BigDecimal.valueOf(request.getNotes500() * 500)
                .add(BigDecimal.valueOf(request.getNotes200() * 200))
                .add(BigDecimal.valueOf(request.getNotes100() * 100))
                .add(BigDecimal.valueOf(request.getNotes50() * 50))
                .add(BigDecimal.valueOf(request.getNotes20() * 20))
                .add(BigDecimal.valueOf(request.getNotes10() * 10))
                .add(BigDecimal.valueOf(request.getCoins5() * 5))
                .add(BigDecimal.valueOf(request.getCoins2() * 2))
                .add(BigDecimal.valueOf(request.getCoins1() * 1));
    }
}
