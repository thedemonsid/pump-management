package com.reallink.pump.dto.request;

import java.time.LocalTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating a new shift")
public class CreateShiftRequest {

  @NotNull(message = "Pump Master ID is required")
  @Schema(description = "Pump Master ID this shift belongs to", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
  private UUID pumpMasterId;

  @NotBlank(message = "Shift name is required")
  @Size(min = 2, max = 50, message = "Shift name must be between 2 and 50 characters")
  @Schema(description = "Shift name", example = "Morning Shift")
  private String name;

  @Size(max = 200, message = "Description cannot exceed 200 characters")
  @Schema(description = "Shift description", example = "Early morning shift from 6 AM to 2 PM")
  private String description;

  @NotNull(message = "Start time is required")
  @Schema(description = "Shift start time", example = "06:00:00")
  private LocalTime startTime;

  @NotNull(message = "End time is required")
  @Schema(description = "Shift end time", example = "14:00:00")
  private LocalTime endTime;
}
