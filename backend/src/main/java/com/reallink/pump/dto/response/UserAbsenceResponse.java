package com.reallink.pump.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.enums.AbsenceType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for user absence record")
public class UserAbsenceResponse {

    @Schema(description = "Unique identifier of the absence record")
    private UUID id;

    @Schema(description = "ID of the user")
    private UUID userId;

    @Schema(description = "Username of the user")
    private String username;

    @Schema(description = "Role of the user")
    private String userRole;

    @Schema(description = "ID of the pump master")
    private UUID pumpMasterId;

    @Schema(description = "Date of absence")
    private LocalDate absenceDate;

    @Schema(description = "Type of absence (FULL_DAY, HALF_DAY, or OVERTIME)")
    private AbsenceType absenceType;

    @Schema(description = "Reason for absence")
    private String reason;

    @Schema(description = "Additional notes")
    private String notes;

    @Schema(description = "Whether the absence is approved")
    private Boolean isApproved;

    @Schema(description = "Username of the approver")
    private String approvedBy;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Version for optimistic locking")
    private Long version;
}
