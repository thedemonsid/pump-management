package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for dip reading information")
public class DipReadingResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Tank ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID tankId;

    @Schema(description = "Tank name", example = "Tank 1")
    private String tankName;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Pump master name", example = "Main Station")
    private String pumpMasterName;

    @Schema(description = "Product name", example = "Premium Gasoline")
    private String productName;

    @Schema(description = "Timestamp when the reading was taken", example = "2025-11-14T10:30:00")
    private LocalDateTime readingTimestamp;

    @Schema(description = "Physical dip level measurement in mm or cm", example = "1500.50")
    private BigDecimal dipLevel;

    @Schema(description = "Fuel density measurement", example = "0.8450")
    private BigDecimal density;

    @Schema(description = "Temperature measurement in Celsius", example = "25.50")
    private BigDecimal temperature;

    @Schema(description = "Calculated fuel level in litres from dip reading", example = "5000.75")
    private BigDecimal fuelLevelLitres;

    @Schema(description = "System calculated fuel level", example = "5001.50")
    private BigDecimal fuelLevelSystem;

    @Schema(description = "Variance between physical and system readings", example = "-0.75")
    private BigDecimal variance;

    @Schema(description = "Additional notes or observations", example = "Tank was recently refilled")
    private String remarks;

    @Schema(description = "Tank information")
    private TankSummary tank;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Record last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Entry creator", example = "admin")
    private String entryBy;

    @Data
    @Schema(description = "Tank summary information")
    public static class TankSummary {

        @Schema(description = "Tank ID")
        private UUID id;

        @Schema(description = "Tank name")
        private String tankName;

        @Schema(description = "Tank capacity in litres")
        private BigDecimal capacity;

        @Schema(description = "Product name")
        private String productName;

        @Schema(description = "Current level in litres")
        private BigDecimal currentLevel;

        @Schema(description = "Tank location")
        private String tankLocation;
    }
}
