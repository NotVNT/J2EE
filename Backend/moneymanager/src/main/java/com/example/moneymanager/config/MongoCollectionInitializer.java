package com.example.moneymanager.config;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Initializes MongoDB collections and indexes for chat history on application startup.
 * This is needed because spring.data.mongodb.auto-index-creation=false is set
 * to avoid blocking startup when SRV DNS resolve is slow.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MongoCollectionInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            initChatCollections();
        } catch (Exception e) {
            log.warn("Failed to initialize MongoDB chat collections (non-fatal): {}", e.getMessage(), e);
        }
    }

    private void initChatCollections() {
        MongoDatabase db = mongoTemplate.getDb();

        // ── chat_sessions ──────────────────────────────────────────────────────
        createCollectionIfAbsent(db, "chat_sessions");
        MongoCollection<Document> sessions = db.getCollection("chat_sessions");

        ensureIndex(sessions,
                Indexes.ascending("userId"),
                new IndexOptions().name("userId_idx"));

        // TTL index on updatedAt — documents expire after 30 days
        ensureIndex(sessions,
                Indexes.ascending("updatedAt"),
                new IndexOptions()
                        .name("updatedAt_ttl_idx")
                        .expireAfter(2592000L, TimeUnit.SECONDS));

        // ── chat_messages ──────────────────────────────────────────────────────
        createCollectionIfAbsent(db, "chat_messages");
        MongoCollection<Document> messages = db.getCollection("chat_messages");

        // Compound index for fetching messages by session ordered by time
        ensureIndex(messages,
                Indexes.compoundIndex(
                        Indexes.ascending("sessionId"),
                        Indexes.ascending("timestamp")),
                new IndexOptions().name("sessionId_timestamp_idx"));

        // TTL index on timestamp — messages expire after 30 days
        ensureIndex(messages,
                Indexes.ascending("timestamp"),
                new IndexOptions()
                        .name("timestamp_ttl_idx")
                        .expireAfter(2592000L, TimeUnit.SECONDS));

        log.info("MongoDB chat collections initialized: chat_sessions, chat_messages");
    }

    private void createCollectionIfAbsent(MongoDatabase db, String collectionName) {
        boolean exists = false;
        for (String name : db.listCollectionNames()) {
            if (name.equals(collectionName)) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            db.createCollection(collectionName);
            log.info("Created MongoDB collection: {}", collectionName);
        }
    }

    private void ensureIndex(MongoCollection<Document> collection, org.bson.conversions.Bson keys, IndexOptions options) {
        try {
            collection.createIndex(keys, options);
        } catch (Exception e) {
            // Index already exists with the same name — safe to ignore
            if (!e.getMessage().contains("already exists") && !e.getMessage().contains("IndexOptionsConflict")) {
                log.warn("Could not create index '{}': {}", options.getName(), e.getMessage());
            }
        }
    }
}
