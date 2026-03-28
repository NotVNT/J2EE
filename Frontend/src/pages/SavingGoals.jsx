import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext.jsx";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import Dashboard from "../components/Dashboard.jsx";
import SavingGoalList from "../components/SavingGoalList.jsx";
import SavingGoalForm from "../components/SavingGoalForm.jsx";
import ContributionModal from "../components/ContributionModal.jsx";
import TransactionOtpModal from "../components/TransactionOtpModal.jsx";
import Modal from "../components/Modal.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";

const getRemainingSeconds = (targetTime, now) => {
  if (!targetTime) return 0;

  const diff = new Date(targetTime).getTime() - now;
  return diff > 0 ? Math.ceil(diff / 1000) : 0;
};

const SavingGoals = () => {
  useUser();
  const { user } = useContext(AppContext);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null });
  const [contributionGoal, setContributionGoal] = useState(null);
  const [openContributionOtpModal, setOpenContributionOtpModal] = useState(false);

  const [pendingContribution, setPendingContribution] = useState(null);
  const [contributionOtpRequestId, setContributionOtpRequestId] = useState(null);
  const [contributionOtpMeta, setContributionOtpMeta] = useState(null);
  const [contributionOtpCode, setContributionOtpCode] = useState("");
  const [contributionOtpStatusMessage, setContributionOtpStatusMessage] = useState("");
  const [contributionOtpError, setContributionOtpError] = useState("");
  const [isRequestingContributionOtp, setIsRequestingContributionOtp] = useState(false);
  const [isSubmittingContributionWithOtp, setIsSubmittingContributionWithOtp] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await axiosConfig.get(API_ENDPOINTS.GET_SAVING_GOALS);
      if (res.data) {
        setGoals(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch saving goals:", error);
      toast.error("Không thể tải danh sách mục tiêu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (dto) => {
    try {
      await axiosConfig.post(API_ENDPOINTS.ADD_SAVING_GOAL, dto);
      toast.success("Tạo mục tiêu thành công.");
      setShowAddModal(false);
      fetchGoals();
    } catch (error) {
      console.error("Failed to create saving goal:", error);
      toast.error(error.response?.data?.message || "Không thể tạo mục tiêu.");
    }
  };

  const handleUpdateGoal = async (dto) => {
    try {
      await axiosConfig.put(API_ENDPOINTS.UPDATE_SAVING_GOAL(editGoal.id), dto);
      toast.success("Cập nhật mục tiêu thành công.");
      setEditGoal(null);
      fetchGoals();
    } catch (error) {
      console.error("Failed to update saving goal:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật mục tiêu.");
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_SAVING_GOAL(id));
      toast.success("Đã xóa mục tiêu.");
      setDeleteAlert({ show: false, id: null });
      fetchGoals();
    } catch (error) {
      console.error("Failed to delete saving goal:", error);
      toast.error(error.response?.data?.message || "Không thể xóa mục tiêu.");
    }
  };

  const requestContributionOtp = async (
    goal = pendingContribution?.goal,
    contributionPayload = pendingContribution?.dto
  ) => {
    if (!goal?.id || !contributionPayload) {
      toast.error("Không có dữ liệu đóng góp để xác thực OTP.");
      return false;
    }

    setIsRequestingContributionOtp(true);
    setContributionOtpError("");
    setContributionOtpStatusMessage("");

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.REQUEST_TRANSACTION_OTP, {
        actionType: "SAVING_GOAL_CONTRIBUTION",
        goalId: goal.id,
        amount: contributionPayload.amount,
        date: contributionPayload.contributionDate,
        note: contributionPayload.note,
      });

      setContributionOtpRequestId(response.data.otpRequestId);
      setContributionOtpMeta(response.data);
      setContributionOtpCode("");
      setContributionOtpStatusMessage(
        response.data.message || "Mã OTP đã được gửi tới email của bạn."
      );
      setContributionGoal(null);
      setOpenContributionOtpModal(true);
      toast.success(response.data.message || "Đã gửi OTP xác nhận đóng góp.");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Không thể gửi OTP đóng góp tiết kiệm.";
      setContributionOtpError(message);
      toast.error(message);
      return false;
    } finally {
      setIsRequestingContributionOtp(false);
    }
  };

  const handleContribute = async (goal, dto) => {
    const normalizedContribution = {
      amount: Number(dto.amount),
      contributionDate: dto.contributionDate,
      note: dto.note?.trim() || null,
    };

    setPendingContribution({
      goal,
      dto: normalizedContribution,
    });

    return requestContributionOtp(goal, normalizedContribution);
  };

  const submitContributionWithOtp = async () => {
    if (!pendingContribution?.goal?.id || !pendingContribution?.dto) {
      setContributionOtpError("Không tìm thấy dữ liệu đóng góp đang chờ xác nhận.");
      return;
    }

    if (!contributionOtpRequestId) {
      setContributionOtpError("Vui lòng yêu cầu OTP trước.");
      return;
    }

    if (!contributionOtpCode.trim()) {
      setContributionOtpError("Vui lòng nhập mã OTP.");
      return;
    }

    setIsSubmittingContributionWithOtp(true);
    setContributionOtpError("");

    try {
      const verifyResponse = await axiosConfig.post(API_ENDPOINTS.VERIFY_TRANSACTION_OTP, {
        otpRequestId: contributionOtpRequestId,
        otpCode: contributionOtpCode.trim(),
      });

      await axiosConfig.post(
        API_ENDPOINTS.ADD_SAVING_GOAL_CONTRIBUTION(pendingContribution.goal.id),
        {
          ...pendingContribution.dto,
          transactionAuthorizationToken: verifyResponse.data.transactionAuthorizationToken,
        }
      );

      setOpenContributionOtpModal(false);
      resetContributionOtpState();
      toast.success("Đóng góp tiết kiệm thành công.");
      fetchGoals();
    } catch (error) {
      const message = error.response?.data?.message || "Không thể đóng góp tiết kiệm.";
      setContributionOtpError(message);
      toast.error(message);
    } finally {
      setIsSubmittingContributionWithOtp(false);
    }
  };

  const resetContributionOtpState = () => {
    setPendingContribution(null);
    setContributionOtpRequestId(null);
    setContributionOtpMeta(null);
    setContributionOtpCode("");
    setContributionOtpStatusMessage("");
    setContributionOtpError("");
  };

  return (
    <Dashboard activeMenu="SavingGoals">
      <div className="mx-auto my-5">
        <div className="grid grid-cols-1 gap-6">
          <SavingGoalList
            goals={goals}
            loading={loading}
            onAddClick={() => setShowAddModal(true)}
            onEdit={(goal) => setEditGoal(goal)}
            onDelete={(id) => setDeleteAlert({ show: true, id })}
            onContribute={(goal) => setContributionGoal(goal)}
          />

          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Tạo mục tiêu tiết kiệm"
          >
            <SavingGoalForm onSave={handleCreateGoal} onCancel={() => setShowAddModal(false)} />
          </Modal>

          <Modal
            isOpen={!!editGoal}
            onClose={() => setEditGoal(null)}
            title="Cập nhật mục tiêu"
          >
            <SavingGoalForm
              initialData={editGoal}
              isEditing={true}
              onSave={handleUpdateGoal}
              onCancel={() => setEditGoal(null)}
            />
          </Modal>

          <Modal
            isOpen={deleteAlert.show}
            onClose={() => setDeleteAlert({ show: false, id: null })}
            title="Xóa mục tiêu"
          >
            <DeleteAlert
              content="Bạn có chắc chắn muốn xóa mục tiêu này không? Toàn bộ lịch sử đóng góp của mục tiêu này cũng sẽ bị xóa."
              onDelete={() => handleDeleteGoal(deleteAlert.id)}
            />
          </Modal>

          {contributionGoal ? (
            <ContributionModal
              goal={contributionGoal}
              onClose={() => setContributionGoal(null)}
              onContribute={handleContribute}
            />
          ) : null}

          <TransactionOtpModal
            isOpen={openContributionOtpModal}
            onClose={() => {
              setOpenContributionOtpModal(false);
              resetContributionOtpState();
            }}
            title="Xác thực OTP đóng góp tiết kiệm"
            actionLabel="đóng góp tiết kiệm"
            maskedEmail={contributionOtpMeta?.maskedEmail || user?.email}
            transactionName={pendingContribution?.goal?.name}
            transactionAmount={
              pendingContribution?.dto?.amount
                ? `${Number(pendingContribution.dto.amount).toLocaleString("vi-VN")} VND`
                : "--"
            }
            transactionDate={pendingContribution?.dto?.contributionDate || "--"}
            otpCode={contributionOtpCode}
            onOtpChange={setContributionOtpCode}
            onRequestOtp={() => requestContributionOtp()}
            onConfirm={submitContributionWithOtp}
            isRequestingOtp={isRequestingContributionOtp}
            isConfirming={isSubmittingContributionWithOtp}
            otpRequestId={contributionOtpRequestId}
            otpResendCountdown={getRemainingSeconds(contributionOtpMeta?.resendAvailableAt, now)}
            otpExpiryCountdown={getRemainingSeconds(contributionOtpMeta?.otpExpiresAt, now)}
            statusMessage={contributionOtpStatusMessage}
            errorMessage={contributionOtpError}
          />
        </div>
      </div>
    </Dashboard>
  );
};

export default SavingGoals;
