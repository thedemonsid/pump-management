package com.reallink.pump.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing user")
public class UpdateUserRequest {

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Username for login", example = "john_doe")
    private String username;

    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    @Schema(description = "User password", example = "newSecurePassword123")
    private String password;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Mobile number should be valid")
    @Schema(description = "Mobile number", example = "+919876543210")
    private String mobileNumber;

    @Schema(description = "User role name", example = "ADMIN")
    private String role;

    @Schema(description = "Whether the user is enabled", example = "true")
    private Boolean enabled;
}
