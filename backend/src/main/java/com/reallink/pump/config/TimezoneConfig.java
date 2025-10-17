package com.reallink.pump.config;

import java.util.TimeZone;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.annotation.PostConstruct;

@Configuration
public class TimezoneConfig {

    /**
     * Set the JVM default timezone to IST on application startup
     */
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    /**
     * Configure Jackson to serialize dates in IST timezone
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonObjectMapperCustomization() {
        return jacksonObjectMapperBuilder -> {
            jacksonObjectMapperBuilder.timeZone(TimeZone.getTimeZone("Asia/Kolkata"));
            jacksonObjectMapperBuilder.modules(new JavaTimeModule());
            jacksonObjectMapperBuilder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
    }
}
