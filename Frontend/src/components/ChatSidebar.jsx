import { useState } from "react";
import { Plus, MessageSquare, Trash2, Pencil, Check, X, PanelLeftClose } from "lucide-react";

const groupSessions = (sessions) => {
  const now = new Date();
  const today = [];
  const yesterday = [];
  const last7 = [];
  const last30 = [];

  sessions.forEach(s => {
    const d = new Date(s.updatedAt);
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) today.push(s);
    else if (diffDays === 1) yesterday.push(s);
    else if (diffDays <= 7) last7.push(s);
    else last30.push(s);
  });

  const groups = [];
  if (today.length) groups.push({ label: "Hôm nay", items: today });
  if (yesterday.length) groups.push({ label: "Hôm qua", items: yesterday });
  if (last7.length) groups.push({ label: "7 ngày trước", items: last7 });
  if (last30.length) groups.push({ label: "30 ngày trước", items: last30 });
  return groups;
};

const ChatSidebar = ({
  sessions,
  activeSessionId,
  isLoading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  showMobile,
  onCloseMobile,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const grouped = groupSessions(sessions);

  const startRename = (session) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const confirmRename = () => {
    if (editTitle.trim() && editingId) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (sessionId) => {
    onDeleteSession(sessionId);
    setConfirmDelete(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
            bg-amber-500/15 hover:bg-amber-500/25 text-amber-400
            border border-amber-500/20 hover:border-amber-500/40
            text-sm font-medium transition-all duration-200"
        >
          <Plus size={16} />
          Cuộc trò chuyện mới
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
            Đang tải...
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm px-4 text-center">
            <MessageSquare size={24} className="mb-2 opacity-50" />
            Chưa có cuộc trò chuyện nào
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={gi}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((session) => (
                  <div key={session.id} className="group relative">
                    {editingId === session.id ? (
                      <div className="flex items-center gap-1 px-2 py-1.5">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          className="flex-1 bg-white/10 rounded-lg px-2 py-1 text-xs text-slate-200
                            border border-white/10 focus:outline-none focus:border-amber-500/40"
                        />
                        <button onClick={confirmRename} className="p-1 text-green-400 hover:bg-white/10 rounded">
                          <Check size={14} />
                        </button>
                        <button onClick={cancelRename} className="p-1 text-slate-400 hover:bg-white/10 rounded">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => onSelectSession(session.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                          text-sm transition-all duration-150
                          ${activeSessionId === session.id
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "text-slate-300 hover:bg-white/5 hover:text-slate-100"}`}
                      >
                        <MessageSquare size={14} className="shrink-0 opacity-60" />
                        <span className="flex-1 truncate">{session.title}</span>

                        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); startRename(session); }}
                            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-white/10 rounded"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(session.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDelete && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e1e36] border border-white/10 rounded-xl p-5 mx-4 shadow-2xl">
            <p className="text-sm text-slate-200 mb-4">Xoá cuộc trò chuyện này?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-white/5 transition"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400
                  hover:bg-red-500/30 border border-red-500/20 transition"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {showMobile && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onCloseMobile}>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72
        bg-[#1e1e36] border-r border-white/5
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${showMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/favicon.png" alt="Logo" className="w-8 h-8 max-w-none object-cover scale-110" />
            </div>
            <span className="text-sm font-bold text-slate-200 tracking-tight">
              Nova<span className="text-amber-400">Money</span>
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="flex-1 relative">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
