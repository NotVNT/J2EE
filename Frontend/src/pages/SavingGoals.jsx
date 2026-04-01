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

const SavingGoals = () => {
  useUser();
  const { user } = useContext(AppContext);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null });
  const [contributionGoal, setContributionGoal] = useState(null);

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

  const handleContribute = async (goal, dto) => {
    const normalizedContribution = {
      amount: Number(dto.amount),
      contributionDate: dto.contributionDate,
      note: dto.note?.trim() || null,
    };

    try {
      await axiosConfig.post(
        API_ENDPOINTS.ADD_SAVING_GOAL_CONTRIBUTION(goal.id),
        normalizedContribution
      );

      setContributionGoal(null);
      toast.success("Đóng góp tiết kiệm thành công.");
      fetchGoals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đóng góp tiết kiệm.");
    }
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
        </div>
      </div>
    </Dashboard>
  );
};

export default SavingGoals;
