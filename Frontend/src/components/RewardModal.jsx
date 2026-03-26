import { useMemo, useState } from "react";
import { Gift, Smartphone, Gamepad2 } from "lucide-react";
import Modal from "./Modal.jsx";

const fmt = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(n) || 0);

const DENOMINATIONS = [20000, 50000, 100000, 200000, 500000];

const RewardModal = ({ goal, onClose, onClaim }) => {
    const [rewardType, setRewardType] = useState("GAME_CARD");
    const [amount, setAmount] = useState("");
    const [claimDate, setClaimDate] = useState(new Date().toISOString().split("T")[0]);
    const [note, setNote] = useState("");

    const balance = useMemo(() => Number(goal?.savingFundBalance || 0), [goal]);

    const handleSubmit = async () => {
        const parsedAmount = Number(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            alert("Vui lòng nhập mệnh giá hợp lệ");
            return;
        }
        if (parsedAmount > balance) {
            alert("Mệnh giá vượt quá quỹ tiết kiệm còn lại");
            return;
        }

        const ok = await onClaim(goal.id, {
            rewardType,
            amount: parsedAmount,
            claimDate,
            note: note.trim() || null,
        });

        if (ok) {
            onClose();
        }
    };

    const fmtInput = (v) => {
        if (!v && v !== 0) return "";
        return Number(v).toLocaleString("vi-VN");
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Tự thưởng – ${goal.name}`}>
            <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500">Quỹ tiết kiệm còn lại</span>
                        <span className="font-semibold text-emerald-700">{fmt(balance)}</span>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-slate-800">Loại thẻ thưởng</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setRewardType("GAME_CARD")}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                rewardType === "GAME_CARD"
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <Gamepad2 size={16} /> Thẻ game
                        </button>
                        <button
                            onClick={() => setRewardType("PHONE_CARD")}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                rewardType === "PHONE_CARD"
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <Smartphone size={16} /> Card điện thoại
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-800">Mệnh giá (VND)</label>
                    <input
                        type="text"
                        value={fmtInput(amount)}
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                        placeholder="VD: 100,000"
                        className="form-input"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                        {DENOMINATIONS.map((value) => (
                            <button
                                key={value}
                                onClick={() => setAmount(String(value))}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
                            >
                                {fmt(value)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-800">Ngày nhận thưởng</label>
                    <input
                        type="date"
                        value={claimDate}
                        onChange={(e) => setClaimDate(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-800">Ghi chú (tuỳ chọn)</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="VD: Tự thưởng vì hoàn thành sớm"
                        className="form-input"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                    <Gift size={16} /> Xác nhận tự thưởng
                </button>
            </div>
        </Modal>
    );
};

export default RewardModal;
