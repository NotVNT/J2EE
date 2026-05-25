package com.example.moneymanager.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "chatgptoss")
public record ChatGptOssProperties(
        java.util.List<String> apiKeys,
        String model,
        String baseUrl,
        Integer timeoutSeconds
) {
}
