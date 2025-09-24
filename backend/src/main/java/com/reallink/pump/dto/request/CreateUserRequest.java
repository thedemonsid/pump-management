package com.reallink.pump.dto.request;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new user")
public class CreateUserRequest {

    @NotNull(message = "Pump Master ID is required")
    @Schema(description = "Pump Master ID this user belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private UUID pumpMasterId;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Username for login", example = "john_doe", required = true)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    @Schema(description = "User password", example = "securePassword123", required = true)
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Mobile number should be valid")
    @Schema(description = "Mobile number", example = "+919876543210", required = true)
    private String mobileNumber;

    @NotNull(message = "Role is required")
    @Schema(description = "User role name", example = "ADMIN", required = true)
    private String role;

    @Schema(description = "Whether the user is enabled", example = "true", defaultValue = "true")
    private Boolean enabled = true;
}
