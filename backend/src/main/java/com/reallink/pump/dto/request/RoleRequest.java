package com.reallink.pump.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating/updating a role")
public class RoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(min = 2, max = 50, message = "Role name must be between 2 and 50 characters")
    @Schema(description = "Role name", example = "ADMIN", required = true)
    private String roleName;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    @Schema(description = "Role description", example = "Administrator role with full access")
    private String description;
}
