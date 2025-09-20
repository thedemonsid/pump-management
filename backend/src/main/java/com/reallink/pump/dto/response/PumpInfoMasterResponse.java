package com.reallink.pump.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for pump information")
public class PumpInfoMasterResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump ID", example = "1")
    private Integer pumpId;

    @Schema(description = "Pump code", example = "PUMP001")
    private String pumpCode;

    @Schema(description = "Pump name", example = "Main Pump Station")
    private String pumpName;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
