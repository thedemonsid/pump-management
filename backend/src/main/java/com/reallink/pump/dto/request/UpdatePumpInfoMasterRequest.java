package com.reallink.pump.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing pump")
public class UpdatePumpInfoMasterRequest {

    @NotBlank(message = "Pump name is required")
    @Size(min = 2, max = 100, message = "Pump name must be between 2 and 100 characters")
    @Schema(description = "Pump display name", example = "Updated Pump Station", required = true)
    private String pumpName;
}
