package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.shift.CashDistributionRequest;
import com.reallink.pump.dto.shift.CashDistributionResponse;
import com.reallink.pump.dto.shift.CreateShiftAccountingRequest;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.EmployeeSalaryPayment;
import com.reallink.pump.entities.PaymentMethod;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.entities.SalesmanShiftAccounting;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.BankTransactionRepository;
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
    private final BankAccountRepository bankAccountRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final SecurityHelper securityHelper;

    private static final BigDecimal ADVANCE_PAYMENT_THRESHOLD = new BigDecimal("50.00");
    private static final DateTimeFormatter SHIFT_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");

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

        // Create advance payment only for negative balance (cash shortage)
        // When there's a shortage >= 50, create advance that will be deducted from salary
        if (balanceAmount.compareTo(BigDecimal.ZERO) < 0
                && balanceAmount.abs().compareTo(ADVANCE_PAYMENT_THRESHOLD) >= 0) {
            EmployeeSalaryPayment advancePayment = createAdvancePayment(shift, balanceAmount);
            accounting.setAdvancePayment(advancePayment);
            log.info("Created advance payment of {} for salesman {} from shift {} cash shortage",
                    balanceAmount.abs(), shift.getSalesman().getUsername(), shiftId);
        }

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

        // Handle advance payment based on balance amount
        // Only create/update advance for negative balance (cash shortage)
        BigDecimal oldBalance = accounting.getBalanceAmount();
        boolean hadAdvancePayment = accounting.getAdvancePayment() != null;

        // Check if negative balance meets threshold (cash shortage only)
        if (balanceAmount.compareTo(BigDecimal.ZERO) < 0
                && balanceAmount.abs().compareTo(ADVANCE_PAYMENT_THRESHOLD) >= 0) {
            // Create or update advance payment
            if (hadAdvancePayment) {
                // Update existing advance payment with absolute value
                BigDecimal advanceAmount = balanceAmount.abs();
                EmployeeSalaryPayment existingPayment = accounting.getAdvancePayment();
                existingPayment.setAmount(advanceAmount);
                existingPayment.setPaymentDate(LocalDateTime.now());
                String shiftInfo = shift.getSalesman().getUsername() + " - " + shift.getStartDatetime().format(SHIFT_DATE_FORMATTER);
                existingPayment.setNotes("Cash shortage of ₹" + advanceAmount + " from shift (" + shiftInfo + "). Will be deducted from salary.");

                log.info("Updated advance payment from {} to {} for shift {}", oldBalance.abs(), advanceAmount, shiftId);
            } else {
                // Create new advance payment
                EmployeeSalaryPayment advancePayment = createAdvancePayment(shift, balanceAmount);
                accounting.setAdvancePayment(advancePayment);
                log.info("Created new advance payment of {} for salesman {} from shift {}",
                        balanceAmount.abs(), shift.getSalesman().getUsername(), shiftId);
            }
        } else if (hadAdvancePayment) {
            // Balance is positive or below threshold, remove advance payment
            accounting.setAdvancePayment(null);
            log.info("Removed advance payment for shift {} as balance is now {}", shiftId, balanceAmount);
        }

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

        // Delete all cash distribution transactions linked to this accounting
        bankTransactionRepository.deleteByShiftAccountingId(accounting.getId());
        log.info("Deleted cash distribution transactions for shift accounting {}", accounting.getId());

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

    // ==================== CASH DISTRIBUTION METHODS ====================
    /**
     * Distribute cash from shift accounting to bank accounts. Only MANAGER and
     * ADMIN can distribute cash.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<CashDistributionResponse> distributeCash(UUID shiftId, CashDistributionRequest request) {
        SalesmanShiftAccounting accounting = accountingRepository.findBySalesmanShiftId(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Accounting not found for this shift"));

        SalesmanShift shift = accounting.getSalesmanShift();
        String currentUser = securityHelper.getCurrentUsername();

        List<BankTransaction> transactions = new ArrayList<>();

        for (CashDistributionRequest.DistributionItem item : request.getDistributions()) {
            BankAccount bankAccount = bankAccountRepository.findById(item.getBankAccountId())
                    .orElseThrow(() -> new EntityNotFoundException("Bank account not found: " + item.getBankAccountId()));

            // Create bank transaction for cash distribution (CREDIT to bank)
            String shiftInfo = shift.getSalesman().getUsername() + " - " + shift.getStartDatetime().format(SHIFT_DATE_FORMATTER);
            BankTransaction transaction = new BankTransaction();
            transaction.setBankAccount(bankAccount);
            transaction.setAmount(item.getAmount());
            transaction.setTransactionType(BankTransaction.TransactionType.CREDIT);
            transaction.setDescription("Cash deposit from shift (" + shiftInfo + ")");
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setPaymentMethod(PaymentMethod.CASH);
            transaction.setShiftAccounting(accounting);
            transaction.setEntryBy(currentUser);

            transactions.add(bankTransactionRepository.save(transaction));
        }

        log.info("Distributed cash from shift {} to {} bank accounts by {}",
                shiftId, transactions.size(), currentUser);

        return transactions.stream()
                .map(this::mapToDistributionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all cash distributions for a shift accounting.
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public List<CashDistributionResponse> getCashDistributions(UUID shiftId) {
        SalesmanShiftAccounting accounting = accountingRepository.findBySalesmanShiftId(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Accounting not found for this shift"));

        List<BankTransaction> transactions = bankTransactionRepository
                .findByShiftAccountingIdOrderByCreatedAtDesc(accounting.getId());

        return transactions.stream()
                .map(this::mapToDistributionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get total distributed amount for a shift accounting.
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public BigDecimal getTotalDistributed(UUID shiftId) {
        SalesmanShiftAccounting accounting = accountingRepository.findBySalesmanShiftId(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Accounting not found for this shift"));

        return bankTransactionRepository.getTotalDistributedByShiftAccountingId(accounting.getId());
    }

    /**
     * Delete all cash distributions for a shift accounting. Only MANAGER and
     * ADMIN can delete distributions.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public void deleteCashDistributions(UUID shiftId) {
        SalesmanShiftAccounting accounting = accountingRepository.findBySalesmanShiftId(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Accounting not found for this shift"));

        bankTransactionRepository.deleteByShiftAccountingId(accounting.getId());

        log.info("Deleted all cash distributions for shift {} by {}", shiftId, securityHelper.getCurrentUsername());
    }

    /**
     * Delete a single cash distribution transaction. Only MANAGER and ADMIN can
     * delete.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public void deleteCashDistribution(UUID transactionId) {
        BankTransaction transaction = bankTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found: " + transactionId));

        if (transaction.getShiftAccounting() == null) {
            throw new PumpBusinessException("NOT_DISTRIBUTION", "This transaction is not a cash distribution");
        }

        bankTransactionRepository.delete(transaction);

        log.info("Deleted cash distribution transaction {} by {}", transactionId, securityHelper.getCurrentUsername());
    }

    private CashDistributionResponse mapToDistributionResponse(BankTransaction transaction) {
        CashDistributionResponse response = new CashDistributionResponse();
        response.setId(transaction.getId());
        response.setBankAccountId(transaction.getBankAccount().getId());
        response.setBankAccountName(transaction.getBankAccount().getAccountHolderName());
        response.setBankName(transaction.getBankAccount().getBank());
        response.setAccountNumber(transaction.getBankAccount().getAccountNumber());
        response.setAmount(transaction.getAmount());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setEntryBy(transaction.getEntryBy());
        response.setCreatedAt(transaction.getCreatedAt());
        return response;
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

    /**
     * Create an advance salary payment from shift balance amount. Only for
     * negative balance (cash shortage) - creates advance as positive amount
     * which will be deducted from future salary.
     *
     * NOTE: This does NOT create a bank transaction because: 1. The cash
     * shortage is not an actual bank debit - the money was never in the bank 2.
     * This is just a record that the salesman owes money, which will be
     * deducted from their salary 3. The actual bank transaction will happen
     * when salary is paid (reduced amount)
     */
    private EmployeeSalaryPayment createAdvancePayment(SalesmanShift shift, BigDecimal balanceAmount) {
        // Get the first available bank account for the pump (needed for the payment record)
        List<BankAccount> bankAccounts = bankAccountRepository.findByPumpMaster_Id(shift.getPumpMaster().getId());
        if (bankAccounts.isEmpty()) {
            throw new PumpBusinessException("NO_BANK_ACCOUNT",
                    "No bank account found for pump master. Cannot create advance payment.");
        }
        BankAccount bankAccount = bankAccounts.get(0);

        // Use absolute value for advance payment amount (always positive)
        // This represents cash shortage that will be deducted from salary
        BigDecimal advanceAmount = balanceAmount.abs();

        // Format shift date for human-readable reference
        String shiftDate = shift.getStartDatetime().format(SHIFT_DATE_FORMATTER);
        String salesmanName = shift.getSalesman().getUsername();

        // Create advance salary payment WITHOUT bank transaction
        // The bank transaction is not created because:
        // - Cash shortage means money was not deposited, not that money was taken from bank
        // - This is just a tracking record for salary deduction
        EmployeeSalaryPayment payment = new EmployeeSalaryPayment();
        payment.setUser(shift.getSalesman());
        payment.setPumpMaster(shift.getPumpMaster());
        payment.setCalculatedSalary(null); // This is an advance payment, not linked to calculated salary
        payment.setBankAccount(bankAccount);
        payment.setAmount(advanceAmount); // Always positive
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(PaymentMethod.CASH);
        // Use salesman name and shift date for human-readable reference (max 50 chars)
        String referenceNumber = "ADV-" + salesmanName.substring(0, Math.min(salesmanName.length(), 15)) + "-" + shift.getStartDatetime().format(DateTimeFormatter.ofPattern("ddMMyy-HHmm"));
        payment.setReferenceNumber(referenceNumber);
        payment.setNotes("Cash shortage of ₹" + advanceAmount + " from shift (" + salesmanName + " - " + shiftDate + "). Will be deducted from salary.");
        // No bank transaction - this is just a tracking record, not an actual bank debit
        payment.setBankTransaction(null);

        return payment;
    }
}
