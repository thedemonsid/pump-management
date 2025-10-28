package com.reallink.pump.dto.shift;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.SalesmanShift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for shift operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftResponse {

    private UUID id;
    private UUID salesmanId;
    private String salesmanUsername;
    private String salesmanFullName;
    private UUID pumpMasterId;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private BigDecimal openingCash;
    private String status;
    private Boolean isAccountingDone;

    // Summary fields
    private Integer nozzleCount;
    private Integer openNozzleCount;
    private BigDecimal totalFuelSales;
    private BigDecimal totalCredit;
    private BigDecimal totalPayments;

    /**
     * Convert entity to response DTO.
     */
    public static ShiftResponse from(SalesmanShift shift) {
        if (shift == null) {
            return null;
        }

        return ShiftResponse.builder()
                .id(shift.getId())
                .salesmanId(shift.getSalesman() != null ? shift.getSalesman().getId() : null)
                .salesmanUsername(shift.getSalesman() != null ? shift.getSalesman().getUsername() : null)
                .salesmanFullName(shift.getSalesman() != null ? shift.getSalesman().getUsername() : null)
                .pumpMasterId(shift.getPumpMaster() != null ? shift.getPumpMaster().getId() : null)
                .startDatetime(shift.getStartDatetime())
                .endDatetime(shift.getEndDatetime())
                .openingCash(shift.getOpeningCash())
                .status(shift.getStatus() != null ? shift.getStatus().name() : null)
                .isAccountingDone(shift.getIsAccountingDone())
                .nozzleCount(shift.getNozzleAssignments() != null ? shift.getNozzleAssignments().size() : 0)
                .openNozzleCount((int) shift.getOpenNozzleCount())
                .totalFuelSales(shift.calculateTotalFuelSales())
                .totalCredit(shift.calculateTotalCredit())
                .totalPayments(shift.calculateTotalPayments())
                .build();
    }

    /**
     * Convert entity to response DTO with minimal info (for list views).
     */
    public static ShiftResponse fromMinimal(SalesmanShift shift) {
        if (shift == null) {
            return null;
        }

        return ShiftResponse.builder()
                .id(shift.getId())
                .salesmanId(shift.getSalesman() != null ? shift.getSalesman().getId() : null)
                .salesmanUsername(shift.getSalesman() != null ? shift.getSalesman().getUsername() : null)
                .salesmanFullName(shift.getSalesman() != null ? shift.getSalesman().getUsername() : null)
                .pumpMasterId(shift.getPumpMaster() != null ? shift.getPumpMaster().getId() : null)
                .startDatetime(shift.getStartDatetime())
                .endDatetime(shift.getEndDatetime())
                .openingCash(shift.getOpeningCash())
                .status(shift.getStatus() != null ? shift.getStatus().name() : null)
                .isAccountingDone(shift.getIsAccountingDone())
                .build();
    }
}
