import { useState, useEffect } from "react";
import { Send, Bell, BellOff, Clock, Search, RefreshCw, Pencil, Trash2, X, Check, Megaphone, AlertTriangle, Sparkles, LoaderCircle } from "lucide-react";
import axiosConfig from "../../util/axiosConfig";
import { API_ENDPOINTS } from "../../util/apiEndpoints";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useTranslation } from "../../hooks/useTranslation.js";

const NOTIFICATION_TYPE_COLORS = {
  ADMIN: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-500/15",
  SYSTEM: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/15",
  BUDGET_ALERT: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-500/15",
  SPENDING_ALERT: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-500/15",
  PAYMENT: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border-violet-500/15",
  GOAL_PROGRESS: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/15",
};

const NOTIFICATION_TYPE_ICONS = {
  ADMIN: Bell,
  SYSTEM: Sparkles,
  BUDGET_ALERT: AlertTriangle,
  SPENDING_ALERT: AlertTriangle,
  PAYMENT: Megaphone,
  GOAL_PROGRESS: Sparkles,
};

const useNotificationTypes = () => {
  const { t } = useTranslation();
  return {
    ADMIN: { label: t("admin.notifTypeAdmin"), color: NOTIFICATION_TYPE_COLORS.ADMIN, icon: NOTIFICATION_TYPE_ICONS.ADMIN },
    SYSTEM: { label: t("admin.notifTypeSystem"), color: NOTIFICATION_TYPE_COLORS.SYSTEM, icon: NOTIFICATION_TYPE_ICONS.SYSTEM },
    BUDGET_ALERT: { label: t("admin.notifTypeBudget"), color: NOTIFICATION_TYPE_COLORS.BUDGET_ALERT, icon: NOTIFICATION_TYPE_ICONS.BUDGET_ALERT },
    SPENDING_ALERT: { label: t("admin.notifTypeSpending"), color: NOTIFICATION_TYPE_COLORS.SPENDING_ALERT, icon: NOTIFICATION_TYPE_ICONS.SPENDING_ALERT },
    PAYMENT: { label: t("admin.notifTypePayment"), color: NOTIFICATION_TYPE_COLORS.PAYMENT, icon: NOTIFICATION_TYPE_ICONS.PAYMENT },
    GOAL_PROGRESS: { label: t("admin.notifTypeGoal"), color: NOTIFICATION_TYPE_COLORS.GOAL_PROGRESS, icon: NOTIFICATION_TYPE_ICONS.GOAL_PROGRESS },
  };
};

const AdminNotifications = () => {
  const { t } = useTranslation();
  const NOTIFICATION_TYPES = useNotificationTypes();
  usePageTitle(t("admin.notificationsTitle"), "Money Manager Admin");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState("ADMIN");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());


  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await axiosConfig.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS);
      if (res.status === 200) {
        setBroadcasts(res.data);
      }
    } catch (err) {
      toast.error(t("admin.notifHistoryError"));
      console.error("Failed to fetch broadcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error(t("admin.notifRequiredFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosConfig.post(API_ENDPOINTS.ADMIN_BROADCAST, { title, message, type });
      if (res.status === 200) {
        toast.success(t("admin.notifSent"));
        setTitle("");
        setMessage("");
        setType("ADMIN");
        fetchBroadcasts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin.notifSendError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (b) => {
    setEditingId(b.id);
    setEditTitle(b.title);
    setEditMessage(b.message);
    setEditType(b.type || "ADMIN");
    setDeleteConfirmId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditMessage("");
    setEditType("ADMIN");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editMessage.trim()) {
      toast.error(t("admin.notifRequiredFields"));
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await axiosConfig.put(
        API_ENDPOINTS.ADMIN_NOTIFICATION_UPDATE(editingId),
        { title: editTitle, message: editMessage, type: editType }
      );
      if (res.status === 200) {
        toast.success(t("admin.notifUpdated"));
        setBroadcasts((prev) =>
          prev.map((b) =>
            b.id === editingId ? { ...b, title: editTitle, message: editMessage, type: editType } : b
          )
        );
        handleCancelEdit();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin.notifUpdateError"));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const res = await axiosConfig.delete(API_ENDPOINTS.ADMIN_NOTIFICATION_DELETE(id));
      if (res.status === 200) {
        toast.success(t("admin.notifDeleted"));
        setBroadcasts((prev) => prev.filter((b) => b.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setDeleteConfirmId(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin.notifDeleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBroadcasts = broadcasts.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchTerm]);

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBroadcasts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBroadcasts.map((b) => b.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const listIds = Array.from(selectedIds);
    setIsDeleting(true);
    try {
      const res = await axiosConfig.post(API_ENDPOINTS.ADMIN_NOTIFICATION_DELETE_BULK, listIds);
      if (res.status === 200) {
        toast.success(`${t("admin.notifBulkDeletedPre")}${listIds.length}${t("admin.notifBulkDeletedSuf")}`);
        setBroadcasts((prev) => prev.filter((b) => !selectedIds.has(b.id)));
        setSelectedIds(new Set());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin.notifBulkDeleteError"));
    } finally {
      setIsDeleting(false);
    }
  };


  const charTitleLeft = 120 - title.length;
  const charMsgLeft = 600 - message.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-500/10">
              <Megaphone size={17} />
            </span>
            {t("admin.systemNotifications")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-11">
            {t("admin.broadcastDesc")}
          </p>
        </div>
        <div className="flex items-center gap-2 pl-11 sm:pl-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
            <Bell size={12} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              {broadcasts.length}{t("admin.notifCountSuf")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Compose */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-violet-600"></div>

            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles size={15} />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{t("admin.composeNotif")}</h2>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {t("admin.notifTitle")} <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-bold ${charTitleLeft < 20 ? "text-red-500" : "text-slate-400 dark:text-slate-600"}`}>
                    {charTitleLeft < 0 ? t("admin.overLimit") : `${charTitleLeft}${t("admin.charsLeftSuf")}`}
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-[#0A0E1A]/80 border border-slate-200 dark:border-white/8 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#070a13] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-semibold transition-all placeholder:font-normal placeholder:text-slate-500"
                  placeholder={t("admin.notifTitlePlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  {t("admin.notifType")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-[#0A0E1A]/80 border border-slate-200 dark:border-white/8 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#070a13] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-semibold transition-all cursor-pointer"
                >
                  {Object.entries(NOTIFICATION_TYPES).map(([key, val]) => (
                    <option key={key} value={key} className="dark:bg-[#0F172A] font-semibold">
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {t("admin.notifContent")} <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-bold ${charMsgLeft < 60 ? "text-red-500" : "text-slate-400"}`}>
                    {charMsgLeft < 0 ? t("admin.overLimit") : `${charMsgLeft}${t("admin.charsLeftSuf")}`}
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 600))}
                  rows={6}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-[#0A0E1A]/80 border border-slate-200 dark:border-white/8 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#070a13] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none text-sm transition-all placeholder:font-normal placeholder:text-slate-500"
                  placeholder={t("admin.notifContentPlaceholder")}
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <LoaderCircle size={18} className="animate-spin text-white" />
                  ) : (
                    <>
                      <Send size={15} /> {t("admin.sendToAll")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm min-h-[520px] flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("admin.notifHistory")}</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{t("admin.broadcastSent")}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={14} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("nav.searchPlaceholder")}
                    className="pl-9 pr-4 py-2 w-full sm:w-56 rounded-2xl bg-slate-50/50 dark:bg-[#0A0E1A]/80 border border-slate-200 dark:border-white/8 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#070a13] focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-500 font-semibold"
                  />
                </div>
                <button
                  onClick={fetchBroadcasts}
                  className="w-9 h-9 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/8 text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center cursor-pointer shrink-0"
                  title={t("admin.refresh")}
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {filteredBroadcasts.length > 0 && !loading && (
              <div className="px-6 py-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20 gap-4 flex-wrap border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filteredBroadcasts.length > 0 && selectedIds.size === filteredBroadcasts.length}
                    ref={el => {
                      if (el) {
                        el.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredBroadcasts.length;
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-350 dark:border-white/10 text-indigo-605 focus:ring-indigo-500/20 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-400 select-none">
                    {selectedIds.size > 0 ? `${t("admin.selectedItemsPre")}${selectedIds.size}${t("admin.selectedItemsSuf")}` : t("admin.selectAll")}
                  </span>
                </div>

                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-red-200/50 dark:border-red-500/10 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      {t("admin.deleteSelected")}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 p-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                  <LoaderCircle size={32} className="animate-spin text-indigo-600" />
                  <p className="text-sm font-medium">{t("admin.loadingNotifHistory")}</p>
                </div>
              ) : filteredBroadcasts.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {filteredBroadcasts.map((b) => {
                    const isSelected = selectedIds.has(b.id);
                    return (
                      <div
                        key={b.id}
                        className={`relative rounded-2xl border p-5 transition-all duration-200 overflow-hidden flex gap-4 ${
                          editingId === b.id
                            ? "border-indigo-400/50 dark:border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-500/5 shadow-md shadow-indigo-500/5"
                            : "border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/2 hover:border-slate-200 dark:hover:border-white/8 hover:shadow-sm"
                        } ${isSelected ? "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.04]" : ""}`}
                      >
                        {/* Accent bar */}
                        <div className={`absolute left-0 top-0 w-1 h-full transition-all duration-300 ${editingId === b.id ? "bg-indigo-600" : "bg-transparent"}`} />

                        {/* Checkbox */}
                        {editingId !== b.id && (
                          <div className="shrink-0 flex items-start mt-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelect(b.id, e)}
                              className="w-4 h-4 rounded border-slate-350 dark:border-white/10 text-indigo-605 focus:ring-indigo-500/20 bg-transparent cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                          {editingId === b.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">{t("admin.notifTitle")}</label>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#070a13] border border-indigo-500/50 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                  placeholder={t("admin.notifTitle")}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">{t("admin.notifTypeLabel")}</label>
                                <select
                                  value={editType}
                                  onChange={(e) => setEditType(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#070a13] border border-indigo-500/50 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                  {Object.entries(NOTIFICATION_TYPES).map(([key, val]) => (
                                    <option key={key} value={key} className="dark:bg-[#0F172A] font-semibold">
                                      {val.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">{t("admin.notifContent")}</label>
                                <textarea
                                  value={editMessage}
                                  onChange={(e) => setEditMessage(e.target.value)}
                                  rows={3}
                                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#070a13] border border-indigo-500/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                  placeholder={t("admin.notifContent")}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={isSavingEdit}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-60 cursor-pointer shadow-sm"
                                >
                                  {isSavingEdit ? (
                                    <LoaderCircle size={13} className="animate-spin" />
                                  ) : (
                                    <><Check size={13} /> {t("common.save")}</>
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/8 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                                >
                                  <X size={13} /> {t("common.cancelAlt")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2.5">
                              {/* Top row: title + timestamp + actions */}
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${NOTIFICATION_TYPES[b.type]?.color || NOTIFICATION_TYPES.ADMIN.color}`}>
                                    {(() => {
                                      const IconComponent = NOTIFICATION_TYPES[b.type]?.icon || Bell;
                                      return <IconComponent size={13} />;
                                    })()}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug break-words flex items-center gap-2 flex-wrap">
                                      {b.title}
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${NOTIFICATION_TYPES[b.type]?.color || NOTIFICATION_TYPES.ADMIN.color}`}>
                                        {NOTIFICATION_TYPES[b.type]?.label || b.type}
                                      </span>
                                    </h3>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                      <Clock size={10} />
                                      {new Date(b.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                                  <button
                                    onClick={() => handleStartEdit(b)}
                                    className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 hover:text-blue-700 transition-colors cursor-pointer"
                                    title={t("common.edit")}
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  {deleteConfirmId === b.id ? (
                                    <div className="flex items-center gap-1 bg-red-500/10 p-0.5 rounded-xl border border-red-500/20">
                                      <button
                                        onClick={() => handleDelete(b.id)}
                                        disabled={isDeleting}
                                        className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-[10px] font-extrabold uppercase tracking-wide cursor-pointer shadow-sm"
                                        title={t("admin.confirmDelete")}
                                      >
                                        {isDeleting ? <LoaderCircle size={10} className="animate-spin" /> : t("common.delete")}
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                                        title={t("common.cancelAlt")}
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setDeleteConfirmId(b.id); setEditingId(null); }}
                                      className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                      title={t("admin.deleteNotif")}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-11 break-words font-medium">
                                {b.message}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-center gap-5 p-6 select-none animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-500/10 flex items-center justify-center shadow-inner">
                    <BellOff size={26} className="text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      {t("admin.noNotifs")}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs">
                      {t("admin.noNotifsDesc")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
