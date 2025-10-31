package com.reallink.pump.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve React static assets
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(31536000); // 1 year cache

        registry.addResourceHandler("/fonts/**")
                .addResourceLocations("classpath:/static/fonts/")
                .setCachePeriod(31536000); // 1 year cache

        // Handle favicon and other root-level files
        registry.addResourceHandler("/favicon.svg")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400); // 1 day cache

        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400); // 1 day cache

        registry.addResourceHandler("/vite.svg")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400); // 1 day cache

        registry.addResourceHandler("/manifest.json")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(86400); // 1 day cache
    }
}
