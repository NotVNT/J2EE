package com.example.moneymanager.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "chat_messages")
@CompoundIndexes({
    @CompoundIndex(name = "sessionId_timestamp_idx", def = "{'sessionId': 1, 'timestamp': 1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    private String sessionId;

    private String role;

    private String content;

    @Builder.Default
    @Indexed(expireAfterSeconds = 2592000)
    private Instant timestamp = Instant.now();
}
