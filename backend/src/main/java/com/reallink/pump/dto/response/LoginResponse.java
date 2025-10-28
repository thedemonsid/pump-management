package com.reallink.pump.dto.response;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for login containing JWT token and user information")
public class LoginResponse {

    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;

    @Schema(description = "JWT refresh token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @Schema(description = "Token type", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "User ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID userId;

    @Schema(description = "Username", example = "john_doe")
    private String username;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "User role name", example = "ADMIN")
    private String role;

    @Schema(description = "Mobile number", example = "+919876543210")
    private String mobileNumber;

    @Schema(description = "Whether the user is enabled", example = "true")
    private Boolean enabled;
}
