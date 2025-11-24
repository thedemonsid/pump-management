package com.reallink.pump.dto.shift;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.NozzleAssignment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for nozzle assignment operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NozzleAssignmentResponse {

    private UUID id;
    private UUID shiftId;
    private UUID nozzleId;
    private String nozzleName;
    private UUID salesmanId;
    private String salesmanUsername;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal dispensedAmount;
    private BigDecimal totalAmount;
    private String status;

    // Test information
    private BigDecimal totalTestQuantity;
    private Integer testCount;

    // Product info (from nozzle's tank's product)
    private String productName;
    private BigDecimal productRate;

    /**
     * Convert entity to response DTO.
     */
    public static NozzleAssignmentResponse from(NozzleAssignment assignment) {
        if (assignment == null) {
            return null;
        }

        NozzleAssignmentResponseBuilder builder = NozzleAssignmentResponse.builder()
                .id(assignment.getId())
                .shiftId(assignment.getSalesmanShift() != null ? assignment.getSalesmanShift().getId() : null)
                .nozzleId(assignment.getNozzle() != null ? assignment.getNozzle().getId() : null)
                .nozzleName(assignment.getNozzle() != null ? assignment.getNozzle().getNozzleName() : null)
                .salesmanId(assignment.getSalesman() != null ? assignment.getSalesman().getId() : null)
                .salesmanUsername(assignment.getSalesman() != null ? assignment.getSalesman().getUsername() : null)
                .startTime(assignment.getStartTime())
                .endTime(assignment.getEndTime())
                .openingBalance(assignment.getOpeningBalance())
                .closingBalance(assignment.getClosingBalance())
                .dispensedAmount(assignment.getDispensedAmount())
                .totalAmount(assignment.getTotalAmount())
                .status(assignment.getStatus() != null ? assignment.getStatus().name() : null)
                .totalTestQuantity(assignment.calculateTotalTestQuantity())
                .testCount(assignment.getNozzleTests() != null ? assignment.getNozzleTests().size() : 0);

        // Add product info if available
        if (assignment.getNozzle() != null && assignment.getNozzle().getTank() != null
                && assignment.getNozzle().getTank().getProduct() != null) {
            builder.productName(assignment.getNozzle().getTank().getProduct().getProductName())
                    .productRate(assignment.getNozzle().getTank().getProduct().getSalesRate());
        }

        return builder.build();
    }
}
