import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, MessageCircle, SendHorizontal, Sparkles, X } from "lucide-react";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { AppContext } from "../context/AppContext.jsx";

const QUICK_PROMPTS = [
  "Hãy giới thiệu ngắn gọn về chức năng của bạn",
  "Gợi ý cách quản lý chi tiêu hiệu quả",
  "Tôi nên bắt đầu theo dõi tài chính cá nhân từ đâu?"
];

const PUBLIC_PATHS = new Set([
  "/",
  "/home",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/activate"
]);

const formatAssistantMessage = (content) => {
  if (!content) {
    return [];
  }

  const normalizedContent = content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/([^\n])(\d+\.\s)/g, "$1\n$2")
    .replace(/([^\n])(-\s)/g, "$1\n$2")
    .replace(/([^\n])(•\s)/g, "$1\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalizedContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const ChatWidget = () => {
  const { user } = useContext(AppContext);
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "Xin chào. Tôi là trợ lý AI của Money Manager, có thể trò chuyện và hỗ trợ bạn về quản lý chi tiêu."
    }
  ]);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const shouldHideWidget = !token || PUBLIC_PATHS.has(location.pathname);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (shouldHideWidget) {
    return null;
  }

  const sendMessage = async (promptText) => {
    const trimmedMessage = promptText.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.GEMINI_CHAT, {
        message: trimmedMessage
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            response.data?.reply ||
            "Tôi đã nhận câu hỏi nhưng hiện chưa tạo được câu trả lời phù hợp."
        }
      ]);
    } catch (error) {
      const fallbackMessage =
        error.response?.data?.message ||
        "Hiện tại tôi chưa phản hồi được. Bạn thử lại sau giúp mình nhé.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: fallbackMessage,
          isError: true
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(message);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
          <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-5 py-4 text-white">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
                <Sparkles size={16} />
                Trợ lý AI
              </div>
              <h3 className="mt-2 text-lg font-semibold">
                {user?.fullName ? `Chào ${user.fullName}` : "Xin chào"}
              </h3>
              <p className="mt-1 text-sm text-white/85">
                Hỏi về quản lý chi tiêu, tiết kiệm và cách sử dụng Money Manager.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
              aria-label="Đóng hộp chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Bạn có thể bắt đầu bằng một trong các gợi ý bên dưới hoặc nhập câu hỏi của riêng mình.
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isSending}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {messages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={`flex ${
                  chatMessage.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    chatMessage.role === "user"
                      ? "bg-slate-900 text-white"
                      : chatMessage.isError
                        ? "border border-rose-200 bg-rose-50 text-rose-900"
                        : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {chatMessage.role === "assistant" ? (
                    <div className="space-y-2 break-words">
                      {formatAssistantMessage(chatMessage.content).map((line, index) => (
                        <p key={`${chatMessage.id}-${index}`}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    chatMessage.content
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Trợ lý đang trả lời...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
            <label htmlFor="chat-message" className="sr-only">
              Nhập tin nhắn
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="chat-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                rows={2}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Gửi tin nhắn"
              >
                <SendHorizontal size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="group relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl shadow-slate-900/20 transition hover:bg-emerald-600"
        aria-label={isOpen ? "Đóng trợ lý" : "Mở trợ lý"}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
          {isOpen ? <X size={20} /> : <MessageCircle size={22} />}
        </span>
        <Bot
          size={15}
          className="absolute translate-x-5 -translate-y-5 text-emerald-300 transition group-hover:text-white"
        />
      </button>
    </div>
  );
};

export default ChatWidget;
