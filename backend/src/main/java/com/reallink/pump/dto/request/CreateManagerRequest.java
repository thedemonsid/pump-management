package com.reallink.pump.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new manager")
public class CreateManagerRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Username for login", example = "jane_manager", required = true)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    @Schema(description = "Manager password", example = "securePassword123", required = true)
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Mobile number should be valid")
    @Schema(description = "Mobile number", example = "+919876543210", required = true)
    private String mobileNumber;

    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    @Schema(description = "Email address", example = "jane.manager@example.com")
    private String email;

    @Size(max = 12, message = "Aadhar number cannot exceed 12 characters")
    @Schema(description = "Aadhar card number", example = "123456789012")
    private String aadharNumber;

    @Size(max = 10, message = "PAN number cannot exceed 10 characters")
    @Schema(description = "PAN card number", example = "ABCDE1234F")
    private String panNumber;

    @Schema(description = "Whether the manager is enabled", example = "true", defaultValue = "true")
    private Boolean enabled = true;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.00", message = "Opening balance must be greater than or equal to 0.00")
    @Schema(description = "Opening balance for the manager", example = "0.00", required = true)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @NotNull(message = "Opening balance date is required")
    @Schema(description = "Opening balance date", example = "2023-01-01", required = true)
    private LocalDate openingBalanceDate;
}
