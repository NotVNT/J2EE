package com.example.moneymanager.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "chat_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSession {

    @Id
    private String id;

    @Indexed
    private Long userId;

    private String title;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Indexed(expireAfterSeconds = 2592000)
    private Instant updatedAt = Instant.now();
}
