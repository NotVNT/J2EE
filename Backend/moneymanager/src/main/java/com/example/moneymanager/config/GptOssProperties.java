package com.example.moneymanager.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gptoss")
public record GptOssProperties(
        String apiKey,
        String model,
        String baseUrl,
        Integer timeoutSeconds,
        String appReferer,
        String appTitle
) {
}
