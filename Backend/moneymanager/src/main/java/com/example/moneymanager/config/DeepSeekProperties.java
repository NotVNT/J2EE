package com.example.moneymanager.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "deepseek")
public record DeepSeekProperties(
        java.util.List<String> apiKeys,
        String model,
        String baseUrl,
        Integer timeoutSeconds,
        String appReferer,
        String appTitle
) {
}
