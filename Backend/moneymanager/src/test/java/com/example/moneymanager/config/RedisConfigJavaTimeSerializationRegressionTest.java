package com.example.moneymanager.config;

import com.example.moneymanager.dto.CategoryDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class RedisConfigJavaTimeSerializationRegressionTest {

    @Test
    @DisplayName("REGRESSION: Redis serializer must handle Java 8 date/time DTOs")
    void redisTemplateValueSerializer_mustHandleJavaTimeDtos() {
        RedisConfig redisConfig = new RedisConfig();
        ReflectionTestUtils.setField(redisConfig, "objectMapper", new JacksonConfig().objectMapper());

        RedisConnectionFactory connectionFactory = mock(RedisConnectionFactory.class);
        RedisTemplate<String, Object> redisTemplate = redisConfig.redisTemplate(connectionFactory);
        @SuppressWarnings("unchecked")
        RedisSerializer<Object> valueSerializer = (RedisSerializer<Object>) redisTemplate.getValueSerializer();

        CategoryDTO category = CategoryDTO.builder()
                .id(1L)
                .profileId(210005L)
                .name("expense")
                .icon("wallet")
                .type("expense")
                .createdAt(LocalDateTime.of(2025, 1, 2, 3, 4, 5))
                .updatedAt(LocalDateTime.of(2025, 1, 2, 6, 7, 8))
                .build();

        byte[] serialized = valueSerializer.serialize(List.of(category));

        assertNotNull(serialized, "Redis serializer should produce JSON bytes for DTOs with LocalDateTime");
        assertTrue(new String(serialized, StandardCharsets.UTF_8).contains("2025-01-02T03:04:05"),
                "Serialized payload should keep LocalDateTime as ISO-8601 text");
    }
}
