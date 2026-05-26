import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, MessageSquare, Sparkles, RotateCcw, ArrowLeft, Menu, Square, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import AIConfirmationForm from "./AIConfirmationForm.jsx";
import { INTENT_ICONS, INTENT_LABELS } from "../util/aiIntentParser.js";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "br", "table", "thead", "tbody", "tr", "th", "td"],
};

const fixMarkdown = (content) => {
  if (!content) return "";
  return content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
};

const markdownComponents = {
  p: ({ children }) => <p className="mb-1 last:mb-0 leading-[1.7]">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1 pl-1">{children}</ol>,
  li: ({ children }) => <li className="leading-[1.7]">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-800 dark:text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children, className }) =>
    className ? (
      <code className="font-mono text-xs text-slate-700 dark:text-slate-200">{children}</code>
    ) : (
      <code className="rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 font-mono text-xs text-violet-600 dark:text-amber-300">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="rounded-xl bg-slate-100 dark:bg-white/10 p-3 my-2 overflow-x-auto">{children}</pre>
  ),
  h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1 text-slate-800 dark:text-white">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1 text-slate-800 dark:text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-1.5 mb-0.5 text-slate-700 dark:text-slate-100">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-amber-400 pl-3 my-1 text-slate-500 dark:text-slate-400 italic">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border-collapse border border-slate-200 dark:border-white/10">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50 dark:bg-amber-500/10">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-slate-200 dark:border-white/10 px-2 py-1.5 text-left font-semibold text-slate-700 dark:text-slate-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-200 dark:border-white/10 px-2 py-1.5 text-slate-600 dark:text-slate-300">{children}</td>
  ),
};

const modelLabelMap = {
  "gpt-oss-120b": "GPT-OSS",
  "gemma4-31B": "Nova Lite",
  "gemini-3.1-flash-lite": "Gemini Flash",
  "project-demo": "Nova Lite",
};

const AIActionBar = ({ onRetry, disabled, currentBranch, totalBranches, onPrevBranch, onNextBranch }) => (
  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onRetry}
        disabled={disabled}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition disabled:opacity-50 disabled:cursor-not-allowed"
        title="Thử lại"
      >
        <RotateCcw size={14} />
      </button>
    </div>
    {totalBranches > 1 && (
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <button onClick={onPrevBranch} disabled={currentBranch === 0} className="hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30">
          <ChevronLeft size={14} />
        </button>
        <span>{currentBranch + 1} / {totalBranches}</span>
        <button onClick={onNextBranch} disabled={currentBranch === totalBranches - 1} className="hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30">
          <ChevronRight size={14} />
        </button>
      </div>
    )}
  </div>
);

const ChatWindow = ({
  messages,
  isSending,
  onSendMessage,
  userName,
  messagesEndRef,
  onToggleSidebar,
  selectedProvider,
  isFreePlan,
  onProviderSwitch,
  isProcessingCrud,
  onConfirmAction,
  onCancelConfirmation,
  onUndo,
  onStopGenerating,
}) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [activeBranches, setActiveBranches] = useState({});

  const { visibleMessages } = useMemo(() => {
    const turns = [];
    for (const msg of messages) {
      if (msg.role === "user") {
        const lastTurn = turns[turns.length - 1];
        if (lastTurn && lastTurn.userMsg?.content === msg.content) {
          lastTurn.branches.push({ userMsg: msg, responses: [] });
        } else {
          turns.push({
            id: msg.id || Math.random().toString(),
            userMsg: msg,
            branches: [{ userMsg: msg, responses: [] }]
          });
        }
      } else {
        const lastTurn = turns[turns.length - 1];
        if (lastTurn) {
          const lastBranch = lastTurn.branches[lastTurn.branches.length - 1];
          lastBranch.responses.push(msg);
        } else {
          turns.push({
            id: msg.id || Math.random().toString(),
            userMsg: null,
            branches: [{ userMsg: null, responses: [msg] }]
          });
        }
      }
    }

    const visible = [];
    for (const turn of turns) {
      const activeIdx = activeBranches[turn.id] ?? (turn.branches.length - 1);
      const branch = turn.branches[activeIdx];
      
      if (branch.userMsg) {
        visible.push({ ...branch.userMsg, turnId: turn.id, isUser: true });
      }
      for (const res of branch.responses) {
        visible.push({ 
          ...res, 
          turnId: turn.id, 
          activeIdx, 
          totalBranches: turn.branches.length,
          isLastResponse: res === branch.responses[branch.responses.length - 1]
        });
      }
    }
    return { visibleMessages: visible };
  }, [messages, activeBranches]);

  const hasModelControls = !!onProviderSwitch;

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

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#131314]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 lg:px-4 py-3 shrink-0 border-b border-slate-100 dark:border-white/[0.06] gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {hasModelControls && (
          <div className="relative flex items-center rounded-full bg-slate-100/80 dark:bg-white/[0.06] p-0.5 text-xs font-medium border border-slate-200/60 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => onProviderSwitch("gemini")}
              className={`relative z-10 flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-all duration-200 ease-out ${
                selectedProvider === "gemini"
                  ? "bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-amber-500 dark:to-orange-500 text-white shadow-md shadow-violet-500/20 dark:shadow-amber-500/20 scale-[1.02]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
              } ${isFreePlan ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Sparkles size={12} className={selectedProvider === "gemini" ? "text-white" : ""} />
              <span className="tracking-wide">Agent{isFreePlan ? " 🔒" : ""}</span>
            </button>
            <button
              type="button"
              onClick={() => onProviderSwitch("gptoss")}
              className={`relative z-10 flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-all duration-200 ease-out ${
                selectedProvider === "gptoss"
                  ? "bg-slate-800 dark:bg-white/[0.14] text-white dark:text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              <MessageSquare size={12} className={selectedProvider === "gptoss" ? "text-white" : ""} />
              <span className="tracking-wide">Chat</span>
            </button>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 relative" style={{ scrollbarWidth: "thin" }}>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
            {/* Subtle center gradient orb - dark mode only */}
            <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-[100%] blur-[100px] opacity-30 pointer-events-none" style={{
              background: "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.4) 0%, rgba(30, 58, 138, 0.1) 40%, transparent 70%)"
            }} />

            <h1 className="text-3xl lg:text-4xl font-normal text-slate-800 dark:text-[#e3e3e3] mb-8 text-center relative z-10">
              Nay đến lượt bạn nhé!
            </h1>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            {visibleMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                <div
                  className={`max-w-[80%] text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "bg-[#202124] text-slate-200 rounded-[20px] px-5 py-3"
                      : msg.isError
                        ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 rounded-bl-md px-4 py-3"
                        : msg.isSystem
                          ? "border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-bl-md px-4 py-3"
                          : "bg-transparent text-slate-700 dark:text-slate-200 rounded-bl-md px-4 py-3"}`}
                >
                  {msg.isIntent && !msg.isConfirmation && (
                    <AIConfirmationForm
                      intent={msg.intent || "UNKNOWN"}
                      extractedFields={msg.extractedFields || {}}
                      suggestedValues={msg.suggestedValues || {}}
                      confirmationPrompt={msg.confirmationPrompt}
                      onConfirm={onConfirmAction || (() => {})}
                      onCancel={onCancelConfirmation || (() => {})}
                      isProcessing={isProcessingCrud}
                    />
                  )}

                  {msg.isIntent && msg.isConfirmation && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400">
                      <span>{INTENT_ICONS[msg.intent]}</span>
                      <span>{INTENT_LABELS[msg.intent] || msg.intent}</span>
                      <span className="text-green-500 dark:text-green-400">đã xác nhận</span>
                    </div>
                  )}

                  {msg.isUndoAction && (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-500 dark:text-amber-400">{msg.content}</p>
                      {onUndo && (
                        <button
                          type="button"
                          onClick={() => onUndo(msg.operationId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 transition hover:bg-amber-100 dark:hover:bg-amber-500/25"
                        >
                          <RotateCcw size={12} />
                          Hoàn tác
                        </button>
                      )}
                    </div>
                  )}

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
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                          Nova · {modelLabelMap[msg.modelUsed] || msg.modelLabel || msg.modelUsed}
                        </span>
                      )}
                    </>
                  )}

                  {msg.role === "assistant" && !msg.isIntent && !msg.isUndoAction && !msg.isError && !msg.isSystem && !isSending && msg.isLastResponse && (
                    <AIActionBar
                      onRetry={() => {
                        for (let j = messages.length - 1; j >= 0; j--) {
                          const prev = messages[j];
                          if (prev.role === "user" && !prev.isSystem && !prev.isIntent && prev.turnId === msg.turnId) {
                            // Wait, the turnId is not on the original messages array. We can just use the content from msg's grouped turn.
                            // Actually it's easier to just find the last user message of the flat array up to this point. 
                            // Or better, just resend the last visible user message!
                          }
                        }
                        // We can just rely on the visible message text
                        // Since we know the turnId, we can just resend the user message text.
                        // However, onSendMessage just appends a new message.
                        // Let's resend the exact same text. We can find the corresponding userMsg.
                        const correspondingUserMsg = visibleMessages.find(m => m.turnId === msg.turnId && m.role === "user");
                        if (correspondingUserMsg) {
                          onSendMessage(correspondingUserMsg.content);
                        }
                      }}
                      disabled={isSending}
                      currentBranch={msg.activeIdx}
                      totalBranches={msg.totalBranches}
                      onPrevBranch={() => setActiveBranches(prev => ({ ...prev, [msg.turnId]: msg.activeIdx - 1 }))}
                      onNextBranch={() => setActiveBranches(prev => ({ ...prev, [msg.turnId]: msg.activeIdx + 1 }))}
                    />
                  )}

                  {msg.role === "user" && <p>{msg.content}</p>}
                </div>

              </div>
            ))}
            {isSending && (
              <div className="flex gap-3 max-w-3xl mx-auto">
                <div className="flex items-center gap-1.5 px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-violet-400 dark:bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-400 dark:bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-400 dark:bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className={`px-3 lg:px-4 pb-4 pt-2 ${isEmpty ? "" : ""}`}>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Main input box - pill shape */}
          <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-[#1e1f20] rounded-[32px]
            focus-within:bg-white dark:focus-within:bg-[#282a2c]
            shadow-sm dark:shadow-none
            transition-all duration-300 pl-6 pr-4 py-3 min-h-[60px]">

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedProvider === "gemini"
                  ? "Hỏi Nova..."
                  : "Hỏi Nova..."
              }
              rows={1}
              className="flex-1 bg-transparent text-[15px] text-slate-800 dark:text-[#e3e3e3] placeholder-slate-500 dark:placeholder-[#c4c7c5]
                resize-none outline-none py-2.5 max-h-[200px]"
              style={{ scrollbarWidth: "thin" }}
            />

            <button
              type={isSending ? "button" : "submit"}
              onClick={isSending ? onStopGenerating : undefined}
              disabled={!input.trim() && !isSending}
              className="p-2.5 rounded-full text-slate-500 dark:text-[#c4c7c5] hover:bg-slate-200 dark:hover:bg-white/10
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200 shrink-0"
            >
              {isSending ? <Square size={24} className="fill-current" /> : <ArrowUp size={24} />}
            </button>
          </div>

          {hasModelControls && !isEmpty && (
            <div className="flex items-center justify-end mt-2 px-1 lg:hidden">
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          )}

          <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-2">
            Nova có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
