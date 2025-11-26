package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.response.EmployeeLedgerEntryResponse;
import com.reallink.pump.dto.response.EmployeeLedgerResponse;
import com.reallink.pump.dto.response.EmployeeLedgerSummaryResponse;
import com.reallink.pump.entities.CalculatedSalary;
import com.reallink.pump.entities.EmployeeSalaryPayment;
import com.reallink.pump.entities.User;
import com.reallink.pump.repositories.CalculatedSalaryRepository;
import com.reallink.pump.repositories.EmployeeSalaryPaymentRepository;
import com.reallink.pump.repositories.UserRepository;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeLedgerService {

    private final CalculatedSalaryRepository calculatedSalaryRepository;
    private final EmployeeSalaryPaymentRepository employeeSalaryPaymentRepository;
    private final UserRepository userRepository;

    /**
     * Get employee ledger data with date range filtering
     */
    public EmployeeLedgerResponse getEmployeeLedger(
            @NotNull UUID userId,
            @NotNull LocalDate fromDate,
            @NotNull LocalDate toDate) {

        // Fetch user to get opening balance
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        // Calculate the date one day before fromDate for "before" calculations
        LocalDate beforeDate = fromDate.minusDays(1);

        // Get opening balance from user entity
        BigDecimal openingBalance = user.getOpeningBalance();
        LocalDate openingBalanceDate = user.getOpeningBalanceDate();

        // Get data before the date range
        BigDecimal totalSalariesBefore = getTotalSalariesUntilDate(userId, beforeDate);
        BigDecimal totalPaymentsBefore = getTotalPaymentsUntilDate(userId, beforeDate);
        BigDecimal balanceBefore = openingBalance.add(totalSalariesBefore).subtract(totalPaymentsBefore);

        // Get data within the date range
        List<CalculatedSalary> salariesInRange = getSalariesInDateRange(userId, fromDate, toDate);
        List<EmployeeSalaryPayment> paymentsInRange = getPaymentsInDateRange(userId, fromDate, toDate);

        BigDecimal totalSalariesInRange = salariesInRange.stream()
                .map(CalculatedSalary::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaymentsInRange = paymentsInRange.stream()
                .map(EmployeeSalaryPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate cumulative totals
        BigDecimal totalSalariesTillDate = totalSalariesBefore.add(totalSalariesInRange);
        BigDecimal totalPaymentsTillDate = totalPaymentsBefore.add(totalPaymentsInRange);
        BigDecimal closingBalance = openingBalance.add(totalSalariesTillDate).subtract(totalPaymentsTillDate);

        // Create ledger entries
        List<EmployeeLedgerEntryResponse> ledgerEntries = createLedgerEntries(
                salariesInRange, paymentsInRange, balanceBefore);

        // Build summary
        EmployeeLedgerSummaryResponse summary = EmployeeLedgerSummaryResponse.builder()
                .openingBalance(openingBalance)
                .openingBalanceDate(openingBalanceDate)
                .totalSalariesBefore(totalSalariesBefore)
                .totalPaymentsBefore(totalPaymentsBefore)
                .balanceBefore(balanceBefore)
                .totalSalariesInRange(totalSalariesInRange)
                .totalPaymentsInRange(totalPaymentsInRange)
                .totalSalariesTillDate(totalSalariesTillDate)
                .totalPaymentsTillDate(totalPaymentsTillDate)
                .closingBalance(closingBalance)
                .build();

        return EmployeeLedgerResponse.builder()
                .ledgerEntries(ledgerEntries)
                .summary(summary)
                .build();
    }

    /**
     * Get current balance for an employee as of a specific date
     */
    public BigDecimal getCurrentBalance(@NotNull UUID userId, @NotNull LocalDate asOfDate) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        BigDecimal openingBalance = user.getOpeningBalance();
        BigDecimal totalSalaries = getTotalSalariesUntilDate(userId, asOfDate);
        BigDecimal totalPayments = getTotalPaymentsUntilDate(userId, asOfDate);
        return openingBalance.add(totalSalaries).subtract(totalPayments);
    }

    /**
     * Get opening balance for a specific date (balance as of day before)
     */
    public BigDecimal getOpeningBalance(@NotNull UUID userId, @NotNull LocalDate date) {
        LocalDate beforeDate = date.minusDays(1);
        return getCurrentBalance(userId, beforeDate);
    }

    // Private helper methods
    private BigDecimal getTotalSalariesUntilDate(UUID userId, LocalDate untilDate) {
        List<CalculatedSalary> salaries = calculatedSalaryRepository
                .findByUserIdUntilDate(userId, untilDate);

        return salaries.stream()
                .map(CalculatedSalary::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getTotalPaymentsUntilDate(UUID userId, LocalDate untilDate) {
        List<EmployeeSalaryPayment> payments = employeeSalaryPaymentRepository
                .findByUserIdAndPaymentDateBefore(userId, untilDate.plusDays(1).atStartOfDay());

        return payments.stream()
                .map(EmployeeSalaryPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CalculatedSalary> getSalariesInDateRange(UUID userId, LocalDate fromDate, LocalDate toDate) {
        return calculatedSalaryRepository.findByUserIdAndDateRange(
                userId,
                fromDate,
                toDate
        );
    }

    private List<EmployeeSalaryPayment> getPaymentsInDateRange(UUID userId, LocalDate fromDate, LocalDate toDate) {
        return employeeSalaryPaymentRepository.findByUserIdAndPaymentDateBetween(
                userId,
                fromDate.atStartOfDay(),
                toDate.plusDays(1).atStartOfDay()
        );
    }

    private List<EmployeeLedgerEntryResponse> createLedgerEntries(
            List<CalculatedSalary> salaries,
            List<EmployeeSalaryPayment> payments,
            BigDecimal openingBalance) {

        List<EmployeeLedgerEntryResponse> entries = new ArrayList<>();
        BigDecimal runningBalance = openingBalance;

        // Combine salaries and payments into a single list with timestamps
        List<LedgerItem> items = new ArrayList<>();

        for (CalculatedSalary salary : salaries) {
            items.add(new LedgerItem(salary.getCalculationDate().atStartOfDay(), "SALARY", salary, null));
        }

        for (EmployeeSalaryPayment payment : payments) {
            items.add(new LedgerItem(payment.getPaymentDate(), "PAYMENT", null, payment));
        }

        // Sort by date (oldest first for running balance calculation)
        items.sort(Comparator.comparing(LedgerItem::getDateTime));

        // Create ledger entries
        for (LedgerItem item : items) {
            if ("SALARY".equals(item.getType())) {
                CalculatedSalary salary = item.getSalary();
                runningBalance = runningBalance.add(salary.getNetSalary());

                entries.add(EmployeeLedgerEntryResponse.builder()
                        .date(item.getDateTime())
                        .action("Salary Calculated")
                        .type("credit")
                        .creditAmount(salary.getNetSalary())
                        .debitAmount(BigDecimal.ZERO)
                        .balance(runningBalance)
                        .description(formatSalaryDescription(salary))
                        .referenceId(salary.getId().toString())
                        .referenceType("SALARY")
                        .build());
            } else {
                EmployeeSalaryPayment payment = item.getPayment();
                runningBalance = runningBalance.subtract(payment.getAmount());

                entries.add(EmployeeLedgerEntryResponse.builder()
                        .date(item.getDateTime())
                        .action("Payment Made")
                        .type("debit")
                        .creditAmount(BigDecimal.ZERO)
                        .debitAmount(payment.getAmount())
                        .balance(runningBalance)
                        .description(formatPaymentDescription(payment))
                        .referenceId(payment.getId().toString())
                        .referenceType("PAYMENT")
                        .paymentMethod(payment.getPaymentMethod().name())
                        .referenceNumber(payment.getReferenceNumber())
                        .build());
            }
        }

        return entries;
    }

    private String formatSalaryDescription(CalculatedSalary salary) {
        return String.format("Salary for %s to %s (%d days)",
                salary.getFromDate(),
                salary.getToDate(),
                salary.getTotalDays());
    }

    private String formatPaymentDescription(EmployeeSalaryPayment payment) {
        String method = payment.getPaymentMethod().name();
        String ref = payment.getReferenceNumber();
        String notes = payment.getNotes() != null ? " - " + payment.getNotes() : "";
        return String.format("Payment via %s (Ref: %s)%s", method, ref, notes);
    }

    // Helper class to combine salaries and payments for sorting
    private static class LedgerItem {

        private final LocalDateTime dateTime;
        private final String type;
        private final CalculatedSalary salary;
        private final EmployeeSalaryPayment payment;

        public LedgerItem(LocalDateTime dateTime, String type, CalculatedSalary salary,
                EmployeeSalaryPayment payment) {
            this.dateTime = dateTime;
            this.type = type;
            this.salary = salary;
            this.payment = payment;
        }

        public LocalDateTime getDateTime() {
            return dateTime;
        }

        public String getType() {
            return type;
        }

        public CalculatedSalary getSalary() {
            return salary;
        }

        public EmployeeSalaryPayment getPayment() {
            return payment;
        }
    }
}
