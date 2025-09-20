package com.reallink.pump.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request DTO for user login")
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Schema(description = "Username for login", example = "john_doe", required = true)
    private String username;

    @NotBlank(message = "Password is required")
    @Schema(description = "User password", example = "securePassword123", required = true)
    private String password;

    @NotBlank(message = "Pump Code is required")
    @Schema(description = "Pump Code for the user", example = "PUMP001", required = true)
    private String pumpCode;
}
