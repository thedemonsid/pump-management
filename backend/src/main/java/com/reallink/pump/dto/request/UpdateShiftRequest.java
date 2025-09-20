package com.reallink.pump.dto.request;

import java.time.LocalTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for updating an existing shift")
public class UpdateShiftRequest {

    @Size(min = 2, max = 50, message = "Shift name must be between 2 and 50 characters")
    @Schema(description = "Shift name", example = "Morning Shift")
    private String name;

    @Size(max = 200, message = "Description cannot exceed 200 characters")
    @Schema(description = "Shift description", example = "Early morning shift from 6 AM to 2 PM")
    private String description;

    @Schema(description = "Shift start time", example = "06:00:00")
    private LocalTime startTime;

    @Schema(description = "Shift end time", example = "14:00:00")
    private LocalTime endTime;

    @Schema(description = "Whether shift is currently active", example = "true")
    private Boolean isActive;
}
