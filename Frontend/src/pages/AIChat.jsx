import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const AIChat = () => {
  useUser();
  const { user } = useContext(AppContext);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const fetchSessionsTimerRef = useRef(null);

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await axiosConfig.get(API_ENDPOINTS.AI_CHAT_SESSIONS);
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const debouncedFetchSessions = useCallback(() => {
    if (fetchSessionsTimerRef.current) clearTimeout(fetchSessionsTimerRef.current);
    fetchSessionsTimerRef.current = setTimeout(() => fetchSessions(), 2000);
  }, [fetchSessions]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    if (activeSessionId) {
      axiosConfig.get(API_ENDPOINTS.AI_CHAT_MESSAGES(activeSessionId))
        .then(({ data }) => setMessages(data))
        .catch(() => setMessages([]));
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildApiMessages = (roomMessages, newMsg) => {
    const all = [...roomMessages, { role: "user", content: newMsg }];
    return all.map(m => ({ role: m.role, content: m.content }));
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isSending) return;
    setIsSending(true);

    const userMsg = { role: "user", content: text.trim(), timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const apiMessages = buildApiMessages(messages, text.trim());
      const { data } = await axiosConfig.post(API_ENDPOINTS.AI_CHAT, {
        provider: "ninerouter",
        model: "project-demo",
        sessionId: activeSessionId,
        messages: apiMessages,
      });

      const assistantMsg = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.sessionId && !activeSessionId) {
        setActiveSessionId(data.sessionId);
        debouncedFetchSessions();
      } else {
        debouncedFetchSessions();
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setShowMobileSidebar(false);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.AI_CHAT_DELETE_SESSION(sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
      fetchSessions();
    } catch {}
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await axiosConfig.put(API_ENDPOINTS.AI_CHAT_RENAME_SESSION(sessionId), { title: newTitle });
      fetchSessions();
    } catch {}
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a2e] text-slate-200">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isLoading={isLoadingSessions}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        showMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />

      <ChatWindow
        messages={messages}
        isSending={isSending}
        onSendMessage={handleSendMessage}
        userName={user?.fullName}
        messagesEndRef={messagesEndRef}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
      />
    </div>
  );
};

export default AIChat;
