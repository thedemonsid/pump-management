package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for tank information")
public class TankResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Tank name", example = "Tank 1 - Premium")
    private String tankName;

    @Schema(description = "Tank capacity in litres", example = "5000.00")
    private BigDecimal capacity;

    @Schema(description = "Current level in litres", example = "2500.00")
    private BigDecimal currentLevel;

    @Schema(description = "Opening level in litres at opening date", example = "0.00")
    private BigDecimal openingLevel;

    @Schema(description = "Opening level date", example = "2023-12-01")
    private LocalDate openingLevelDate;

    @Schema(description = "Low level alert threshold in litres", example = "500.00")
    private BigDecimal lowLevelAlert;

    @Schema(description = "Tank physical location", example = "Underground - Section A")
    private String tankLocation;

    @Schema(description = "Product information")
    private ProductSummary product;

    @Schema(description = "Number of associated nozzles", example = "2")
    private Integer nozzleCount;

    @Schema(description = "Available capacity", example = "2500.00")
    private BigDecimal availableCapacity;

    @Schema(description = "Fill percentage", example = "50.00")
    private BigDecimal fillPercentage;

    @Schema(description = "Whether tank level is low", example = "false")
    private Boolean isLowLevel;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Data
    public static class ProductSummary {

        private UUID id;
        private String productName;
        private String salesUnit;
    }
}
