package com.reallink.pump.mapper.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.MapperConfig;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Central configuration for all MapStruct mappers in the application. This
 * configuration ensures consistency across all mappers.
 */
@MapperConfig(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface MapperConfiguration {

    /**
     * Convert UTC LocalDateTime to IST LocalDateTime
     */
    @Named("toIST")
    default LocalDateTime toIST(LocalDateTime utcDateTime) {
        if (utcDateTime == null) {
            return null;
        }

        // Assume the LocalDateTime from DB is in UTC
        ZonedDateTime utcZoned = utcDateTime.atZone(ZoneId.of("UTC"));

        // Convert to IST
        ZonedDateTime istZoned = utcZoned.withZoneSameInstant(ZoneId.of("Asia/Kolkata"));

        // Return as LocalDateTime
        return istZoned.toLocalDateTime();
    }

    /**
     * Convert UTC LocalDate to IST LocalDate Note: For LocalDate, timezone
     * conversion typically doesn't change the date unless the conversion
     * crosses midnight. This method is provided for consistency.
     */
    @Named("toISTDate")
    default LocalDate toISTDate(LocalDate utcDate) {
        if (utcDate == null) {
            return null;
        }

        // For LocalDate, we typically don't need timezone conversion
        // But if you need it, convert to LocalDateTime first
        return utcDate;
    }
}
