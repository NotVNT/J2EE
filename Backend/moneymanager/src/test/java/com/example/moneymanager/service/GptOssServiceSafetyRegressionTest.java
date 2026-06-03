package com.example.moneymanager.service;

import com.example.moneymanager.config.GptOssKeyRotator;
import com.example.moneymanager.config.GptOssProperties;
import com.example.moneymanager.dto.AssistantChatResponseDTO;
import com.example.moneymanager.util.AISystemPrompts;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GptOssServiceSafetyRegressionTest {

    @Spy
    private RestClient gptOssRestClient;

    @Test
    @DisplayName("REGRESSION: GPT-OSS assistant chat must reuse the shared hardened system prompt")
    void chat_usesSharedHardenedSystemPrompt() {
        GptOssProperties properties = new GptOssProperties(
                List.of("key-1"),
                "openai/gpt-oss-120b:free",
                "https://openrouter.ai/api/v1",
                60
        );
        GptOssService service = org.mockito.Mockito.spy(new GptOssService(
                gptOssRestClient,
                properties,
                new GptOssKeyRotator(properties),
                new ObjectMapper()
        ));
        doReturn("phan hoi an toan").when(service).callWithPrompt(anyString(), anyString(), anyInt());

        AssistantChatResponseDTO response = service.chat("chi tieu hom nay bao nhieu");

        assertEquals("phan hoi an toan", response.getReply());
        verify(service).callWithPrompt(AISystemPrompts.CHAT_SYSTEM_PROMPT, "chi tieu hom nay bao nhieu", 800);
    }
}
