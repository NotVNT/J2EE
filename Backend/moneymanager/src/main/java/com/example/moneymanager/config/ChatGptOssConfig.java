package com.example.moneymanager.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
@EnableConfigurationProperties(ChatGptOssProperties.class)
public class ChatGptOssConfig {

    @Bean
    public RestClient chatGptOssRestClient(ChatGptOssProperties properties) {
        int timeoutSeconds = properties.timeoutSeconds() != null ? properties.timeoutSeconds() : 60;

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeader("Content-Type", "application/json;charset=UTF-8")
                .requestFactory(requestFactory)
                .build();
    }
}
