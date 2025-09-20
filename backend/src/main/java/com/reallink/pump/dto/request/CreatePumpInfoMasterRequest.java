package com.reallink.pump.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new pump")
public class CreatePumpInfoMasterRequest {

    @NotNull(message = "Pump ID is required")
    @Positive(message = "Pump ID must be positive")
    @Schema(description = "Unique pump identifier", example = "1", required = true)
    private Integer pumpId;

    @NotBlank(message = "Pump code is required")
    @Size(min = 2, max = 20, message = "Pump code must be between 2 and 20 characters")
    @Schema(description = "Unique pump code", example = "PUMP001", required = true)
    private String pumpCode;

    @NotBlank(message = "Pump name is required")
    @Size(min = 2, max = 100, message = "Pump name must be between 2 and 100 characters")
    @Schema(description = "Pump display name", example = "Main Pump Station", required = true)
    private String pumpName;
}
