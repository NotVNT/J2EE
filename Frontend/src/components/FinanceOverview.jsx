import CustomPieChart from "./CustomPieChart.jsx";
import {addThousandsSeparator} from "../util/util.js";

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    const COLORS = ["#59168B", "#a0090e", "#016630"];

    const balanceData = [
        { name: "Tổng số dư", amount: totalBalance },
        { name: "Tổng chi tiêu", amount: totalExpense },
        { name: "Tổng thu nhập", amount: totalIncome },
    ];
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Tổng quan tài chính</h5>
            </div>

            <CustomPieChart
                data={balanceData}
                label="Tổng số dư"
                totalAmount={`${addThousandsSeparator(totalBalance)} VND`}
                colors={COLORS}
                showTextAnchor
            />
        </div>
    )
}

export default FinanceOverview;