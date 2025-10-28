package com.reallink.pump.dto.shift;

import java.util.List;
import java.util.stream.Collectors;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Detailed response DTO for shift with all nested data. Includes nozzle
 * assignments, bills, and payments.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ShiftDetailsResponse extends ShiftResponse {

    private List<NozzleAssignmentResponse> nozzleAssignments;
    private List<ShiftBillSummary> bills;
    private List<ShiftPaymentSummary> payments;
    private ShiftAccountingSummary accounting;

    /**
     * Bill summary for shift details.
     */
    @Data
    @NoArgsConstructor
    public static class ShiftBillSummary {

        private java.util.UUID id;
        private Long billNo;
        private java.time.LocalDate billDate;
        private String customerName;
        private String productName;
        private String vehicleNo;
        private java.math.BigDecimal quantity;
        private java.math.BigDecimal rate;
        private java.math.BigDecimal netAmount;
    }

    /**
     * Payment summary for shift details.
     */
    @Data
    @NoArgsConstructor
    public static class ShiftPaymentSummary {

        private java.util.UUID id;
        private String customerName;
        private java.math.BigDecimal amount;
        private java.time.LocalDateTime paymentDate;
        private String paymentMethod;
        private String referenceNumber;
    }

    /**
     * Accounting summary for shift details.
     */
    @Data
    @NoArgsConstructor
    public static class ShiftAccountingSummary {

        private java.util.UUID id;
        private java.math.BigDecimal fuelSales;
        private java.math.BigDecimal customerReceipt;
        private java.math.BigDecimal upiReceived;
        private java.math.BigDecimal cardReceived;
        private java.math.BigDecimal credit;
        private java.math.BigDecimal expenses;
        private java.math.BigDecimal cashInHand;
        private java.math.BigDecimal balanceAmount;
    }

    /**
     * Create detailed response from shift entity.
     */
    public static ShiftDetailsResponse fromEntity(com.reallink.pump.entities.SalesmanShift shift) {
        ShiftDetailsResponse response = new ShiftDetailsResponse();

        // Copy base fields from ShiftResponse
        ShiftResponse baseResponse = ShiftResponse.from(shift);
        response.setId(baseResponse.getId());
        response.setSalesmanId(baseResponse.getSalesmanId());
        response.setSalesmanUsername(baseResponse.getSalesmanUsername());
        response.setSalesmanFullName(baseResponse.getSalesmanFullName());
        response.setPumpMasterId(baseResponse.getPumpMasterId());
        response.setStartDatetime(baseResponse.getStartDatetime());
        response.setEndDatetime(baseResponse.getEndDatetime());
        response.setOpeningCash(baseResponse.getOpeningCash());
        response.setStatus(baseResponse.getStatus());
        response.setIsAccountingDone(baseResponse.getIsAccountingDone());
        response.setNozzleCount(baseResponse.getNozzleCount());
        response.setOpenNozzleCount(baseResponse.getOpenNozzleCount());
        response.setTotalFuelSales(baseResponse.getTotalFuelSales());
        response.setTotalCredit(baseResponse.getTotalCredit());
        response.setTotalPayments(baseResponse.getTotalPayments());

        // Add nozzle assignments
        if (shift.getNozzleAssignments() != null) {
            response.setNozzleAssignments(
                    shift.getNozzleAssignments().stream()
                            .map(NozzleAssignmentResponse::from)
                            .collect(Collectors.toList())
            );
        }

        // Add bills summary
        if (shift.getCreditBills() != null) {
            response.setBills(
                    shift.getCreditBills().stream()
                            .map(bill -> {
                                ShiftBillSummary summary = new ShiftBillSummary();
                                summary.setId(bill.getId());
                                summary.setBillNo(bill.getBillNo());
                                summary.setBillDate(bill.getBillDate());
                                summary.setCustomerName(bill.getCustomer() != null ? bill.getCustomer().getCustomerName() : null);
                                summary.setProductName(bill.getProduct() != null ? bill.getProduct().getProductName() : null);
                                summary.setVehicleNo(bill.getVehicleNo());
                                summary.setQuantity(bill.getQuantity());
                                summary.setRate(bill.getRate());
                                summary.setNetAmount(bill.getNetAmount());
                                return summary;
                            })
                            .collect(Collectors.toList())
            );
        }

        // Add payments summary
        if (shift.getPayments() != null) {
            response.setPayments(
                    shift.getPayments().stream()
                            .map(payment -> {
                                ShiftPaymentSummary summary = new ShiftPaymentSummary();
                                summary.setId(payment.getId());
                                summary.setCustomerName(payment.getCustomer() != null ? payment.getCustomer().getCustomerName() : null);
                                summary.setAmount(payment.getAmount());
                                summary.setPaymentDate(payment.getPaymentDate());
                                summary.setPaymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null);
                                summary.setReferenceNumber(payment.getReferenceNumber());
                                return summary;
                            })
                            .collect(Collectors.toList())
            );
        }

        // Add accounting summary
        if (shift.getAccounting() != null) {
            ShiftAccountingSummary accountingSummary = new ShiftAccountingSummary();
            accountingSummary.setId(shift.getAccounting().getId());
            accountingSummary.setFuelSales(shift.getAccounting().getFuelSales());
            accountingSummary.setCustomerReceipt(shift.getAccounting().getCustomerReceipt());
            accountingSummary.setUpiReceived(shift.getAccounting().getUpiReceived());
            accountingSummary.setCardReceived(shift.getAccounting().getCardReceived());
            accountingSummary.setCredit(shift.getAccounting().getCredit());
            accountingSummary.setExpenses(shift.getAccounting().getExpenses());
            accountingSummary.setCashInHand(shift.getAccounting().getCashInHand());
            accountingSummary.setBalanceAmount(shift.getAccounting().getBalanceAmount());
            response.setAccounting(accountingSummary);
        }

        return response;
    }
}
