package com.reallink.pump.dto.shift;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for closing a shift.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CloseShiftRequest {

    /**
     * Optional end datetime for the shift. If not provided, defaults to current
     * time. Only ADMIN and MANAGER roles can set custom end datetime.
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDatetime;
}
