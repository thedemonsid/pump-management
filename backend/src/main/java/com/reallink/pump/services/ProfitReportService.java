package com.reallink.pump.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.reallink.pump.dto.response.ExpenseBreakdown;
import com.reallink.pump.dto.response.FuelMetrics;
import com.reallink.pump.dto.response.FuelProfitBreakdown;
import com.reallink.pump.dto.response.ProductWiseProfit;
import com.reallink.pump.dto.response.ProfitReportResponse;
import com.reallink.pump.entities.Expense;
import com.reallink.pump.entities.ExpenseHead;
import com.reallink.pump.entities.FuelPurchase;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.SalesmanShiftAccounting;
import com.reallink.pump.repositories.ExpenseRepository;
import com.reallink.pump.repositories.FuelPurchaseRepository;
import com.reallink.pump.repositories.SalesmanShiftAccountingRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service for generating profit reports focused on fuel sales Uses
 * SalesmanShiftAccounting as the source of truth for fuel sales data
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfitReportService {

    private final SalesmanShiftAccountingRepository accountingRepository;
    private final FuelPurchaseRepository fuelPurchaseRepository;
    private final ExpenseRepository expenseRepository;

    /**
     * Get today's profit report
     */
    public ProfitReportResponse getTodayProfit(UUID pumpMasterId) {
        LocalDate today = LocalDate.now();
        return generateProfitReport(pumpMasterId, today, today, "DAY");
    }

    /**
     * Get current month's profit report
     */
    public ProfitReportResponse getMonthProfit(UUID pumpMasterId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        return generateProfitReport(pumpMasterId, startOfMonth, endOfMonth, "MONTH");
    }

    /**
     * Get current year's profit report
     */
    public ProfitReportResponse getYearProfit(UUID pumpMasterId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(today.getYear(), 1, 1);
        LocalDate endOfYear = LocalDate.of(today.getYear(), 12, 31);
        return generateProfitReport(pumpMasterId, startOfYear, endOfYear, "YEAR");
    }

    /**
     * Get profit report for a specific date
     */
    public ProfitReportResponse getProfitByDate(UUID pumpMasterId, LocalDate date) {
        return generateProfitReport(pumpMasterId, date, date, "DAY");
    }

    /**
     * Get profit report for a specific month
     */
    public ProfitReportResponse getProfitByMonth(UUID pumpMasterId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();
        return generateProfitReport(pumpMasterId, startOfMonth, endOfMonth, "MONTH");
    }

    /**
     * Get profit report for a specific year
     */
    public ProfitReportResponse getProfitByYear(UUID pumpMasterId, int year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);
        return generateProfitReport(pumpMasterId, startOfYear, endOfYear, "YEAR");
    }

    /**
     * Get profit report for a custom date range
     */
    public ProfitReportResponse getProfitByDateRange(UUID pumpMasterId, LocalDate startDate, LocalDate endDate) {
        return generateProfitReport(pumpMasterId, startDate, endDate, "CUSTOM");
    }

    /**
     * Generate comprehensive profit report for the given period
     */
    private ProfitReportResponse generateProfitReport(UUID pumpMasterId, LocalDate startDate,
            LocalDate endDate, String periodType) {

        // Convert LocalDate to LocalDateTime for the query
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        // Fetch all shift accounting records in the period (these contain final fuel sales data)
        List<SalesmanShiftAccounting> accountingRecords = accountingRepository.findByPumpMasterIdAndDateRange(
                pumpMasterId, startDateTime, endDateTime);

        // Fetch all fuel purchases in the period
        List<FuelPurchase> fuelPurchases = fuelPurchaseRepository.findByPumpMasterIdAndDateRange(
                pumpMasterId, startDate, endDate);

        // Fetch all expenses in the period
        List<Expense> expenses = expenseRepository.findByPumpMaster_IdAndExpenseDateBetween(
                pumpMasterId, startDate, endDate);

        // Calculate fuel sales revenue and metrics from accounting records
        FuelSalesData fuelSalesData = calculateFuelSalesDataFromAccounting(accountingRecords);

        // Calculate fuel purchase costs and metrics
        FuelPurchaseData fuelPurchaseData = calculateFuelPurchaseData(fuelPurchases);

        // Calculate operating expenses (excluding shift expenses which are already in accounting)
        BigDecimal operatingExpenses = calculateOperatingExpenses(expenses);
        List<ExpenseBreakdown> expenseBreakdowns = calculateExpenseBreakdowns(expenses);

        // Calculate profit breakdown
        FuelProfitBreakdown profitBreakdown = calculateProfitBreakdown(
                fuelSalesData.revenue, fuelPurchaseData.cost, operatingExpenses);

        // Build fuel metrics
        FuelMetrics fuelMetrics = buildFuelMetrics(fuelSalesData, fuelPurchaseData, accountingRecords.size());

        // Build product-wise profit from fuel purchases (sales are aggregated in accounting)
        List<ProductWiseProfit> productWiseProfits = calculateProductWiseProfitFromPurchases(
                fuelSalesData.revenue, fuelPurchaseData.productPurchases);

        return ProfitReportResponse.builder()
                .periodType(periodType)
                .startDate(startDate.toString())
                .endDate(endDate.toString())
                .fuelProfitBreakdown(profitBreakdown)
                .fuelMetrics(fuelMetrics)
                .productWiseProfit(productWiseProfits)
                .expenseBreakdown(expenseBreakdowns)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Calculate fuel sales data from salesman shift accounting records These
     * contain the final, verified fuel sales amounts
     */
    private FuelSalesData calculateFuelSalesDataFromAccounting(List<SalesmanShiftAccounting> accountingRecords) {
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long shiftCount = accountingRecords.size();

        for (SalesmanShiftAccounting accounting : accountingRecords) {
            // fuelSales in accounting is the final, frozen fuel sales amount for the shift
            totalRevenue = totalRevenue.add(accounting.getFuelSales());
        }

        FuelSalesData result = new FuelSalesData();
        result.revenue = totalRevenue;
        result.shiftCount = shiftCount;
        return result;
    }

    /**
     * Calculate fuel purchase data
     */
    private FuelPurchaseData calculateFuelPurchaseData(List<FuelPurchase> fuelPurchases) {
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;
        Map<UUID, ProductPurchaseData> productPurchaseMap = new HashMap<>();

        for (FuelPurchase purchase : fuelPurchases) {
            BigDecimal cost = purchase.getAmount();
            BigDecimal quantity = purchase.getQuantity();

            totalCost = totalCost.add(cost);
            totalQuantity = totalQuantity.add(quantity);

            // Track product-wise purchases
            Product product = purchase.getTank().getProduct();
            UUID productId = product.getId();
            ProductPurchaseData purchaseData = productPurchaseMap.computeIfAbsent(productId,
                    k -> new ProductPurchaseData(product.getProductName()));
            purchaseData.cost = purchaseData.cost.add(cost);
            purchaseData.quantity = purchaseData.quantity.add(quantity);
        }

        FuelPurchaseData result = new FuelPurchaseData();
        result.cost = totalCost;
        result.totalQuantity = totalQuantity;
        result.purchaseCount = (long) fuelPurchases.size();
        result.productPurchases = productPurchaseMap;
        return result;
    }

    /**
     * Calculate total operating expenses
     */
    private BigDecimal calculateOperatingExpenses(List<Expense> expenses) {
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate expense breakdowns by category
     */
    private List<ExpenseBreakdown> calculateExpenseBreakdowns(List<Expense> expenses) {
        Map<UUID, ExpenseBreakdownData> breakdownMap = new HashMap<>();

        for (Expense expense : expenses) {
            ExpenseHead head = expense.getExpenseHead();
            UUID headId = head.getId();

            ExpenseBreakdownData data = breakdownMap.computeIfAbsent(headId,
                    k -> new ExpenseBreakdownData(head.getHeadName()));
            data.amount = data.amount.add(expense.getAmount());
            data.count++;
        }

        return breakdownMap.entrySet().stream()
                .map(entry -> ExpenseBreakdown.builder()
                .expenseHeadId(entry.getKey().toString())
                .expenseHeadName(entry.getValue().headName)
                .amount(entry.getValue().amount)
                .count(entry.getValue().count)
                .build())
                .collect(Collectors.toList());
    }

    /**
     * Calculate profit breakdown
     */
    private FuelProfitBreakdown calculateProfitBreakdown(BigDecimal revenue,
            BigDecimal purchaseCost, BigDecimal operatingExpenses) {

        BigDecimal grossProfit = revenue.subtract(purchaseCost);
        BigDecimal netProfit = grossProfit.subtract(operatingExpenses);

        // Calculate profit margin (net profit / revenue * 100)
        BigDecimal profitMargin = BigDecimal.ZERO;
        if (revenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = netProfit.divide(revenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return FuelProfitBreakdown.builder()
                .fuelSalesRevenue(revenue)
                .fuelPurchasesCost(purchaseCost)
                .operatingExpenses(operatingExpenses)
                .grossProfit(grossProfit)
                .netProfit(netProfit)
                .profitMargin(profitMargin)
                .build();
    }

    /**
     * Build fuel metrics
     */
    private FuelMetrics buildFuelMetrics(FuelSalesData salesData, FuelPurchaseData purchaseData, int shiftsCount) {
        // Calculate average prices
        BigDecimal avgPurchasePrice = BigDecimal.ZERO;
        if (purchaseData.totalQuantity.compareTo(BigDecimal.ZERO) > 0) {
            avgPurchasePrice = purchaseData.cost.divide(purchaseData.totalQuantity, 2, RoundingMode.HALF_UP);
        }

        // For selling price, we can estimate based on revenue and purchased quantity
        // (since we don't have detailed quantity sold from accounting)
        BigDecimal avgSellingPrice = BigDecimal.ZERO;
        if (purchaseData.totalQuantity.compareTo(BigDecimal.ZERO) > 0) {
            avgSellingPrice = salesData.revenue.divide(purchaseData.totalQuantity, 2, RoundingMode.HALF_UP);
        }

        return FuelMetrics.builder()
                .totalFuelSold(purchaseData.totalQuantity) // Approximate: using purchased quantity
                .totalFuelPurchased(purchaseData.totalQuantity)
                .averageSellingPrice(avgSellingPrice)
                .averagePurchasePrice(avgPurchasePrice)
                .fuelBillsCount((long) shiftsCount) // Count of accounting shifts
                .fuelPurchasesCount(purchaseData.purchaseCount)
                .build();
    }

    /**
     * Calculate product-wise profit from purchases Since accounting gives us
     * total revenue without product breakdown, we distribute profit
     * proportionally based on purchases
     */
    private List<ProductWiseProfit> calculateProductWiseProfitFromPurchases(
            BigDecimal totalRevenue,
            Map<UUID, ProductPurchaseData> productPurchases) {

        List<ProductWiseProfit> result = new ArrayList<>();

        // Calculate total purchase cost for proportion
        BigDecimal totalPurchaseCost = productPurchases.values().stream()
                .map(p -> p.cost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (Map.Entry<UUID, ProductPurchaseData> entry : productPurchases.entrySet()) {
            ProductPurchaseData purchase = entry.getValue();

            // Estimate revenue proportion based on cost proportion
            BigDecimal revenueShare = BigDecimal.ZERO;
            if (totalPurchaseCost.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal proportion = purchase.cost.divide(totalPurchaseCost, 4, RoundingMode.HALF_UP);
                revenueShare = totalRevenue.multiply(proportion).setScale(2, RoundingMode.HALF_UP);
            }

            BigDecimal profit = revenueShare.subtract(purchase.cost);

            BigDecimal avgPurchasePrice = BigDecimal.ZERO;
            if (purchase.quantity.compareTo(BigDecimal.ZERO) > 0) {
                avgPurchasePrice = purchase.cost.divide(purchase.quantity, 2, RoundingMode.HALF_UP);
            }

            BigDecimal avgSellingPrice = BigDecimal.ZERO;
            if (purchase.quantity.compareTo(BigDecimal.ZERO) > 0) {
                avgSellingPrice = revenueShare.divide(purchase.quantity, 2, RoundingMode.HALF_UP);
            }

            result.add(ProductWiseProfit.builder()
                    .productId(entry.getKey().toString())
                    .productName(purchase.productName)
                    .productType("FUEL")
                    .salesRevenue(revenueShare)
                    .purchaseCost(purchase.cost)
                    .profit(profit)
                    .quantitySold(purchase.quantity)
                    .quantityPurchased(purchase.quantity)
                    .avgSellingPrice(avgSellingPrice)
                    .avgPurchasePrice(avgPurchasePrice)
                    .build());
        }

        return result;
    }

    // Helper classes for data aggregation
    private static class FuelSalesData {

        BigDecimal revenue = BigDecimal.ZERO;
        @SuppressWarnings("unused")
        long shiftCount = 0;
    }

    private static class FuelPurchaseData {

        BigDecimal cost = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;
        long purchaseCount = 0;
        Map<UUID, ProductPurchaseData> productPurchases = new HashMap<>();
    }

    private static class ProductPurchaseData {

        String productName;
        BigDecimal cost = BigDecimal.ZERO;
        BigDecimal quantity = BigDecimal.ZERO;

        ProductPurchaseData(String productName) {
            this.productName = productName;
        }
    }

    private static class ExpenseBreakdownData {

        String headName;
        BigDecimal amount = BigDecimal.ZERO;
        long count = 0;

        ExpenseBreakdownData(String headName) {
            this.headName = headName;
        }
    }
}
