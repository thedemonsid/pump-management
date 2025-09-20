package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for nozzle information")
public class NozzleResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Nozzle name", example = "Nozzle 1")
    private String nozzleName;

    @Schema(description = "Manufacturer company name", example = "Petrol Pump Systems")
    private String companyName;

    @Schema(description = "Current reading in litres", example = "12345.678")
    private BigDecimal currentReading;

    @Schema(description = "Physical location of nozzle", example = "Island 1 - Left")
    private String location;

    @Schema(description = "Associated tank ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID tankId;

    @Schema(description = "Product name", example = "Premium Gasoline")
    private String productName;

    @Schema(description = "Tank information")
    private TankSummary tank;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Record last update timestamp")
    private LocalDateTime updatedAt;

    @Data
    @Schema(description = "Tank summary information")
    public static class TankSummary {

        @Schema(description = "Tank ID", example = "123e4567-e89b-12d3-a456-426614174000")
        private UUID id;

        @Schema(description = "Tank name", example = "Tank 1 - Premium")
        private String tankName;

        @Schema(description = "Current level in litres", example = "2500.00")
        private BigDecimal currentLevel;

        @Schema(description = "Tank capacity in litres", example = "5000.00")
        private BigDecimal capacity;

        @Schema(description = "Product information")
        private ProductSummary product;
    }

    @Data
    @Schema(description = "Product summary information")
    public static class ProductSummary {

        @Schema(description = "Product ID", example = "123e4567-e89b-12d3-a456-426614174000")
        private UUID id;

        @Schema(description = "Product name", example = "Premium Gasoline")
        private String productName;

        @Schema(description = "Sales unit", example = "Litre")
        private String salesUnit;
    }
}
