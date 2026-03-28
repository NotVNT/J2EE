import { useEffect, useState } from "react";
import { HandCoins, History } from "lucide-react";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import Modal from "./Modal.jsx";

const fmt = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

const ContributionModal = ({ goal, onClose, onContribute }) => {
  const [tab, setTab] = useState("contribute");
  const [contributions, setContributions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    contributionDate: new Date().toISOString().split("T")[0],
    note: "",
  });

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axiosConfig.get(API_ENDPOINTS.SAVING_GOAL_CONTRIBUTIONS(goal.id));
      if (res.data) {
        setContributions(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch contribution history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (tab === "history") {
      fetchHistory();
    }
  }, [tab]);

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      window.alert("Số tiền đóng góp phải lớn hơn 0.");
      return;
    }

    const ok = await onContribute(goal, {
      amount: Number(form.amount),
      contributionDate: form.contributionDate,
      note: form.note.trim() || null,
    });

    if (ok) {
      setForm({
        amount: "",
        contributionDate: new Date().toISOString().split("T")[0],
        note: "",
      });
      onClose();
    }
  };

  const fmtAmountInput = (value) => {
    if (!value && value !== 0) return "";
    return Number(value).toLocaleString("vi-VN");
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Đóng góp - ${goal.name}`}>
      <div className="mb-4 flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("contribute")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "contribute"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <HandCoins size={16} />
          Đóng góp
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <History size={16} />
          Lịch sử
        </button>
      </div>

      {tab === "contribute" ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Đã có</span>
              <span className="font-semibold text-green-600">{fmt(goal.currentAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-gray-500">Còn thiếu</span>
              <span className="font-semibold text-red-500">{fmt(goal.remainingAmount)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-800">Số tiền đóng góp (VND)</label>
            <input
              type="text"
              value={fmtAmountInput(form.amount)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="VD: 1,000,000"
              className="form-input"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-800">Ngày đóng góp</label>
            <input
              type="date"
              value={form.contributionDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contributionDate: event.target.value,
                }))
              }
              className="form-input"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-800">Ghi chú (tùy chọn)</label>
            <input
              type="text"
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              placeholder="VD: Trích từ lương tháng này"
              className="form-input"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Đóng góp
          </button>
        </div>
      ) : (
        <div>
          {loadingHistory ? (
            <p className="py-6 text-center text-gray-400">Đang tải...</p>
          ) : null}

          {!loadingHistory && contributions.length === 0 ? (
            <p className="py-6 text-center text-gray-400">Chưa có lịch sử đóng góp.</p>
          ) : null}

          {!loadingHistory && contributions.length > 0 ? (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">+ {fmt(contribution.amount)}</p>
                    {contribution.note ? (
                      <p className="text-xs text-gray-400">{contribution.note}</p>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDate(contribution.contributionDate)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
};

export default ContributionModal;
