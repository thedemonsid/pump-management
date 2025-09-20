package com.reallink.pump.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing salesman")
public class UpdateSalesmanRequest {

  @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
  @Schema(description = "Salesman full name", example = "John Doe")
  private String name;

  @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Contact number must be valid")
  @Schema(description = "Contact number", example = "+919876543210")
  private String contactNumber;

  @Email(message = "Email must be valid")
  @Size(max = 100, message = "Email cannot exceed 100 characters")
  @Schema(description = "Email address", example = "john.doe@example.com")
  private String email;

  @Schema(description = "Whether salesman is currently active", example = "true")
  private Boolean active;

  @Size(max = 255, message = "Address cannot exceed 255 characters")
  @Schema(description = "Residential address", example = "123 Main St, City, Country")
  private String address;

  @Size(max = 20, message = "Aadhar card number cannot exceed 20 characters")
  @Schema(description = "Aadhar card number", example = "1234-5678-9012")
  private String aadharCardNumber;

  @Size(max = 20, message = "Pan card number cannot exceed 20 characters")
  @Schema(description = "Pan card number", example = "1234-5678-9012")
  private String panCardNumber;
}
