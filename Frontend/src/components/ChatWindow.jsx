import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SendHorizontal, Bot, Sparkles, PanelLeft, RotateCcw, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import ModelSelector from "./ModelSelector.jsx";
import AIConfirmationForm from "./AIConfirmationForm.jsx";
import { INTENT_ICONS, INTENT_LABELS } from "../util/aiIntentParser.js";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "br", "table", "thead", "tbody", "tr", "th", "td"],
};

const fixMarkdown = (content) => {
  if (!content) return "";
  let text = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return text;
};

const markdownComponents = {
  p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1 pl-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children, className }) =>
    className ? (
      <code className="font-mono text-xs text-slate-200">{children}</code>
    ) : (
      <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-amber-300">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="rounded bg-white/10 p-3 my-2 overflow-x-auto">{children}</pre>
  ),
  h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1 text-white">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1 text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-1.5 mb-0.5 text-slate-100">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-amber-400 pl-3 my-1 text-slate-400 italic">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border-collapse border border-white/10">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-amber-500/10">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-white/10 px-2 py-1.5 text-left font-semibold text-slate-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-white/10 px-2 py-1.5 text-slate-300">{children}</td>
  ),
};

const AGENT_MODEL_OPTIONS_DEFAULT = [
  { value: "gemini",     label: "🤖 Gemini 3.1 Flash Lite" },
  { value: "ninerouter", label: "✨ Nova Lite" },
];

const ChatWindow = ({
  messages,
  isSending,
  onSendMessage,
  userName,
  messagesEndRef,
  onToggleSidebar,
  // Model selector props (optional — only passed from AIChat full page)
  selectedProvider,
  chatModel,
  agentModel,
  agentModelOptions = AGENT_MODEL_OPTIONS_DEFAULT,
  plan,
  isFreePlan,
  onProviderSwitch,
  onModelChange,
  onAgentModelChange,
  // Agent action props
  pendingIntent,
  isProcessingCrud,
  onConfirmAction,
  onCancelConfirmation,
  onUndo,
}) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const hasModelControls = !!onProviderSwitch; // only shown when parent passes the handlers

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isEmpty = messages.length === 0;

  // Derive placeholder from current model
  const inputPlaceholder = (() => {
    if (!hasModelControls) return "Nhập tin nhắn...";
    if (selectedProvider === "gemini") {
      return agentModel === "ninerouter"
        ? "Nhập thao tác: tạo/sửa/xóa dữ liệu... [Nova Lite]"
        : "Nhập thao tác: tạo/sửa/xóa dữ liệu... [Gemini 3.1 Flash-Lite]";
    }
    return chatModel === "ninerouter"
      ? "Nhập câu hỏi hoặc trò chuyện... [Nova Lite]"
      : "Nhập câu hỏi hoặc trò chuyện... [GPT-OSS 120B]";
  })();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a2e]">
      {/* Header bar */}
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-400 hover:text-amber-400 hover:bg-white/5 transition"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
              <Bot size={32} className="text-amber-400" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-200 mb-2 text-center">
              Chào {userName || "bạn"}, hôm nay bạn nghĩ gì?
            </h1>
            <p className="text-slate-500 text-sm text-center max-w-md">
              Tôi là Nova — trợ lý AI tài chính của bạn. Hỏi tôi bất cứ điều gì về chi tiêu, tiết kiệm hay lập kế hoạch.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-amber-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "bg-white/10 text-slate-200 rounded-br-md"
                      : msg.isError
                        ? "bg-red-500/10 text-red-300 border border-red-500/20 rounded-bl-md"
                        : msg.isSystem
                          ? "border border-amber-500/20 bg-amber-500/5 text-amber-400 rounded-bl-md"
                          : "bg-transparent text-slate-300 rounded-bl-md"}`}
                >
                  {/* Intent confirmation form */}
                  {msg.isIntent && !msg.isConfirmation && onConfirmAction && (
                    <AIConfirmationForm
                      intent={msg.intent}
                      extractedFields={msg.extractedFields}
                      suggestedValues={msg.suggestedValues}
                      confirmationPrompt={msg.confirmationPrompt}
                      onConfirm={onConfirmAction}
                      onCancel={onCancelConfirmation}
                      isProcessing={isProcessingCrud}
                    />
                  )}

                  {/* Confirmed intent badge */}
                  {msg.isIntent && msg.isConfirmation && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <span>{INTENT_ICONS[msg.intent]}</span>
                      <span>{INTENT_LABELS[msg.intent] || msg.intent}</span>
                      <span className="text-green-400">đã xác nhận</span>
                    </div>
                  )}

                  {/* Undo action */}
                  {msg.isUndoAction && (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-400">{msg.content}</p>
                      {onUndo && (
                        <button
                          type="button"
                          onClick={() => onUndo(msg.operationId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400 transition hover:bg-amber-500/25"
                        >
                          <RotateCcw size={12} />
                          Hoàn tác
                        </button>
                      )}
                    </div>
                  )}

                  {/* Normal assistant message */}
                  {msg.role === "assistant" && !msg.isIntent && !msg.isUndoAction && (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                        components={markdownComponents}
                      >
                        {fixMarkdown(msg.content)}
                      </ReactMarkdown>
                      {!msg.isError && !msg.isSystem && msg.modelUsed && (
                        <span className="block text-[10px] text-slate-500 mt-1">
                          Nova Money · {msg.modelLabel || msg.modelUsed}
                        </span>
                      )}
                    </>
                  )}

                  {/* User message */}
                  {msg.role === "user" && <p>{msg.content}</p>}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-slate-300 font-semibold">
                      {(userName || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="flex gap-3 max-w-3xl mx-auto">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-amber-400" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input + model controls */}
      <div className="border-t border-white/5 p-3 lg:p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">

          {/* Textarea row */}
          <div className="flex items-end gap-2 bg-white/5 rounded-2xl border border-white/10
            focus-within:border-amber-500/30 focus-within:bg-white/[0.07]
            transition-all duration-200 px-4 py-2">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5 transition shrink-0"
            >
              <PanelLeft size={18} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500
                resize-none outline-none py-1.5 max-h-32"
              style={{ scrollbarWidth: "thin" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-2 rounded-xl bg-amber-500/20 text-amber-400
                hover:bg-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200 shrink-0"
            >
              <SendHorizontal size={16} />
            </button>
          </div>

          {/* Model controls — only when parent passes handlers (AIChat full page) */}
          {hasModelControls && (
            <>
              {/* Model selector */}
              {selectedProvider !== "gemini" ? (
                <div className="px-1">
                  <ModelSelector
                    value={chatModel}
                    onChange={onModelChange}
                    plan={plan}
                  />
                </div>
              ) : (
                <div className="px-1">
                  <ModelSelector
                    value={agentModel}
                    onChange={onAgentModelChange}
                    label="Agent model"
                    options={agentModelOptions}
                    plan={plan}
                  />
                </div>
              )}

              {/* Chat / Agent mode toggle */}
              <div className="flex rounded-xl bg-white/5 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => onProviderSwitch("gemini")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition ${
                    selectedProvider === "gemini"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  } ${isFreePlan ? "opacity-50" : ""}`}
                >
                  <span>🤖</span>
                  <span>Agent {isFreePlan && "🔒"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onProviderSwitch("gptoss")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition ${
                    selectedProvider === "gptoss"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span>💬</span>
                  <span>Chat</span>
                </button>
              </div>
            </>
          )}

          <p className="text-[10px] text-slate-600 text-center">
            Nova có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
