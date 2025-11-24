package com.reallink.pump.dto.shift;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.NozzleTest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for nozzle test operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NozzleTestResponse {

    private UUID id;
    private UUID shiftId;
    private UUID nozzleAssignmentId;
    private UUID nozzleId;
    private String nozzleName;
    private UUID salesmanId;
    private String salesmanUsername;
    private LocalDateTime testDatetime;
    private BigDecimal testQuantity;
    private String remarks;
    private LocalDateTime createdAt;

    // Product info (from nozzle's tank's product)
    private String productName;
    private BigDecimal productRate;

    /**
     * Convert entity to response DTO.
     */
    public static NozzleTestResponse from(NozzleTest test) {
        if (test == null) {
            return null;
        }

        NozzleTestResponseBuilder builder = NozzleTestResponse.builder()
                .id(test.getId())
                .shiftId(test.getSalesmanShift() != null ? test.getSalesmanShift().getId() : null)
                .nozzleAssignmentId(test.getNozzleAssignment() != null ? test.getNozzleAssignment().getId() : null)
                .nozzleId(test.getNozzle() != null ? test.getNozzle().getId() : null)
                .nozzleName(test.getNozzle() != null ? test.getNozzle().getNozzleName() : null)
                .salesmanId(test.getSalesman() != null ? test.getSalesman().getId() : null)
                .salesmanUsername(test.getSalesman() != null ? test.getSalesman().getUsername() : null)
                .testDatetime(test.getTestDatetime())
                .testQuantity(test.getTestQuantity())
                .remarks(test.getRemarks())
                .createdAt(test.getCreatedAt());

        // Add product info if available
        if (test.getNozzle() != null && test.getNozzle().getTank() != null
                && test.getNozzle().getTank().getProduct() != null) {
            builder.productName(test.getNozzle().getTank().getProduct().getProductName())
                    .productRate(test.getNozzle().getTank().getProduct().getSalesRate());
        }

        return builder.build();
    }
}
