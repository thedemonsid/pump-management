package com.reallink.pump.dto.request;

import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a user absence record")
public class CreateUserAbsenceRequest {

    @NotNull(message = "User ID is required")
    @Schema(description = "ID of the user who is absent", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID userId;

    @NotNull(message = "Absence date is required")
    @Schema(description = "Date of absence", example = "2025-11-03")
    private LocalDate absenceDate;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    @Schema(description = "Reason for absence", example = "Medical leave")
    private String reason;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Schema(description = "Additional notes", example = "Doctor's appointment scheduled")
    private String notes;
}
