package com.reallink.pump.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    // Enables JPA Auditing for automatic @CreatedDate and @LastModifiedDate
}
