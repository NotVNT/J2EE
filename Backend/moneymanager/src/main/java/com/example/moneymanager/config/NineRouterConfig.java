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
    public RestClient nineRouterChatRestClient(NineRouterProperties properties) {
        NineRouterProperties.Section chat = properties.chat();
        int timeout = (chat != null && chat.timeoutSeconds() != null) ? chat.timeoutSeconds() : 120;
        String baseUrl = (chat != null && chat.baseUrl() != null) ? chat.baseUrl() : "https://proxy-ai.botdevgroup.me/v1";
        return buildRestClient(baseUrl, timeout);
    }

    @Bean
    public RestClient nineRouterAgentRestClient(NineRouterProperties properties) {
        NineRouterProperties.Section agent = properties.agent();
        int timeout = (agent != null && agent.timeoutSeconds() != null) ? agent.timeoutSeconds() : 120;
        String baseUrl = (agent != null && agent.baseUrl() != null) ? agent.baseUrl() : "https://proxy-ai.botdevgroup.me/v1";
        return buildRestClient(baseUrl, timeout);
    }

    @Bean
    public RestClient nineRouterOcrRestClient(NineRouterProperties properties) {
        NineRouterProperties.Section ocr = properties.ocr();
        int timeout = (ocr != null && ocr.timeoutSeconds() != null) ? ocr.timeoutSeconds() : 120;
        String baseUrl = (ocr != null && ocr.baseUrl() != null) ? ocr.baseUrl() : "https://proxy-ai.botdevgroup.me/v1";
        return buildRestClient(baseUrl, timeout);
    }

    private RestClient buildRestClient(String baseUrl, int timeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Content-Type", "application/json;charset=UTF-8")
                .requestFactory(factory)
                .build();
    }
}
