package com.example.moneymanager.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(NineRouterProperties.class)
public class NineRouterConfig {

    @Bean
    public RestClient nineRouterRestClient(NineRouterProperties properties) {
        int timeoutSeconds = properties.timeoutSeconds() != null ? properties.timeoutSeconds() : 120;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        requestFactory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeader("Content-Type", "application/json;charset=UTF-8")
                .requestFactory(requestFactory)
                .build();
    }
}
