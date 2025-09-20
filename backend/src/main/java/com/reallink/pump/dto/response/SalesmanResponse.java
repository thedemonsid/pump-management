package com.reallink.pump.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for salesman information")
public class SalesmanResponse {

    @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID pumpMasterId;

    @Schema(description = "Salesman full name", example = "John Doe")
    private String name;

    @Schema(description = "Employee ID/Code", example = "EMP001")
    private String employeeId;

    @Schema(description = "Contact phone number", example = "+91-9876543210")
    private String contactNumber;

    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Residential address", example = "123 Main St, City, Country")
    private String address;

    @Schema(description = "Aadhar card number", example = "1234-5678-9012")
    private String aadharCardNumber;

    @Schema(description = "Pan card number", example = "ABCDE1234F")
    private String panCardNumber;

    @Schema(description = "Whether salesman is currently active", example = "true")
    private Boolean active;

    @Schema(description = "Record creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Record last update timestamp")
    private LocalDateTime updatedAt;
}
