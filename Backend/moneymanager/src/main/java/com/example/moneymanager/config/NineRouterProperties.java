package com.example.moneymanager.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ninerouter")
public record NineRouterProperties(Section chat, Section agent, Section ocr) {

    public record Section(
            String apiKey,
            String model,
            String baseUrl,
            Integer timeoutSeconds
    ) {}
}
