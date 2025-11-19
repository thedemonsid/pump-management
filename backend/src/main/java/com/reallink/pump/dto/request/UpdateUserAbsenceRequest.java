package com.reallink.pump.dto.request;

import java.time.LocalDate;

import com.reallink.pump.enums.AbsenceType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating a user absence record")
public class UpdateUserAbsenceRequest {

    @Schema(description = "Date of absence", example = "2025-11-03")
    private LocalDate absenceDate;

    @Schema(description = "Type of absence (FULL_DAY, HALF_DAY, or OVERTIME)", example = "FULL_DAY")
    private AbsenceType absenceType;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    @Schema(description = "Reason for absence", example = "Medical leave")
    private String reason;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Schema(description = "Additional notes", example = "Doctor's appointment scheduled")
    private String notes;

    @Schema(description = "Whether the absence is approved", example = "true")
    private Boolean isApproved;
}
