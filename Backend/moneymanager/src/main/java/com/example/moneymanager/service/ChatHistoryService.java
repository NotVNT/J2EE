package com.example.moneymanager.service;

import com.example.moneymanager.exception.ForbiddenException;
import com.example.moneymanager.model.ChatMessage;
import com.example.moneymanager.model.ChatSession;
import com.example.moneymanager.repository.ChatMessageRepository;
import com.example.moneymanager.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    public List<Map<String, Object>> getSessionsByUserId(Long userId) {
        List<ChatSession> sessions = sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return sessions.stream().map(s -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", s.getId());
            m.put("title", s.getTitle());
            m.put("createdAt", s.getCreatedAt().toString());
            m.put("updatedAt", s.getUpdatedAt().toString());
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMessagesBySessionId(String sessionId, Long currentUserId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        if (!session.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Access denied to session: " + sessionId);
        }
        List<ChatMessage> messages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        return messages.stream().map(m -> {
            Map<String, Object> msg = new java.util.HashMap<>();
            msg.put("id", m.getId());
            msg.put("role", m.getRole());
            msg.put("content", m.getContent());
            msg.put("timestamp", m.getTimestamp().toString());
            return msg;
        }).collect(Collectors.toList());
    }

    public ChatSession createSession(Long userId, String title) {
        ChatSession session = ChatSession.builder()
                .userId(userId)
                .title(title)
                .build();
        return sessionRepository.save(session);
    }

    public ChatMessage addMessage(String sessionId, String role, String content) {
        ChatMessage message = ChatMessage.builder()
                .sessionId(sessionId)
                .role(role)
                .content(content)
                .build();
        ChatMessage saved = messageRepository.save(message);

        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setUpdatedAt(Instant.now());
            sessionRepository.save(session);
        });

        return saved;
    }

    public void renameSession(String sessionId, String newTitle, Long currentUserId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        if (!session.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Access denied to session: " + sessionId);
        }
        session.setTitle(newTitle);
        session.setUpdatedAt(Instant.now());
        sessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(String sessionId, Long currentUserId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        if (!session.getUserId().equals(currentUserId)) {
            throw new ForbiddenException("Access denied to session: " + sessionId);
        }
        sessionRepository.deleteById(sessionId);
        messageRepository.deleteBySessionId(sessionId);
    }
}
