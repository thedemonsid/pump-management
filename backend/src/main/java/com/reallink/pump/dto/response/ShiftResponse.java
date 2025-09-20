package com.reallink.pump.dto.response;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for shift information")
public class ShiftResponse {

  @Schema(description = "Unique identifier", example = "123e4567-e89b-12d3-a456-426614174000")
  private UUID id;

  @Schema(description = "Pump Master ID", example = "123e4567-e89b-12d3-a456-426614174000")
  private UUID pumpMasterId;

  @Schema(description = "Shift name", example = "Morning Shift")
  private String name;

  @Schema(description = "Shift description", example = "Early morning shift from 6 AM to 2 PM")
  private String description;

  @Schema(description = "Shift start time", example = "06:00:00")
  private LocalTime startTime;

  @Schema(description = "Shift end time", example = "14:00:00")
  private LocalTime endTime;

  @Schema(description = "Whether shift is currently active", example = "true")
  private Boolean isActive;

  @Schema(description = "Record creation timestamp")
  private LocalDateTime createdAt;

  @Schema(description = "Record last update timestamp")
  private LocalDateTime updatedAt;
}
