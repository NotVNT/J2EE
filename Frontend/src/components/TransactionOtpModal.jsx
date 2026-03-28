import { LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import Modal from "./Modal.jsx";

const TransactionOtpModal = ({
  isOpen,
  title,
  actionLabel,
  maskedEmail,
  transactionName,
  transactionAmount,
  transactionDate,
  otpCode,
  onOtpChange,
  onRequestOtp,
  onConfirm,
  onClose,
  isRequestingOtp,
  isConfirming,
  otpRequestId,
  otpResendCountdown,
  otpExpiryCountdown,
  statusMessage,
  errorMessage,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Xác thực OTP trước khi {actionLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Hệ thống sẽ gửi mã OTP tới email của bạn để xác nhận thao tác này.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Mail size={16} />
            <span>{maskedEmail || "Email tài khoản"}</span>
          </div>
          <p className="mt-3">
            Tên giao dịch: <strong>{transactionName || "--"}</strong>
          </p>
          <p className="mt-1">
            Số tiền: <strong>{transactionAmount || "--"}</strong>
          </p>
          <p className="mt-1">
            Ngày: <strong>{transactionDate || "--"}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRequestOtp}
            disabled={isRequestingOtp || otpResendCountdown > 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRequestingOtp ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Đang gửi OTP...
              </>
            ) : otpRequestId ? (
              otpResendCountdown > 0 ? `Gửi lại sau ${otpResendCountdown}s` : "Gửi lại OTP"
            ) : (
              "Nhận OTP"
            )}
          </button>
        </div>

        {otpRequestId ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Mã OTP</label>
              <input
                type="text"
                value={otpCode}
                onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Nhập 6 chữ số"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="text-xs text-slate-500">
              {otpExpiryCountdown > 0
                ? `Mã OTP hết hạn sau ${otpExpiryCountdown}s`
                : "Mã OTP hiện tại đã hết hạn, vui lòng yêu cầu mã mới."}
            </div>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirming || otpExpiryCountdown <= 0 || !otpCode.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isConfirming ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                `Xác thực và ${actionLabel}`
              )}
            </button>
          </div>
        ) : null}

        {statusMessage ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
        ) : null}
      </div>
    </Modal>
  );
};

export default TransactionOtpModal;
