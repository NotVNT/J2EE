import { useEffect, useState } from "react";
import {Plus} from "lucide-react";
import CustomLineChart from "./CustomLineChart.jsx";
import {prepareIncomeLineChartData} from "../util/util.js";

const ExpenseOverview = ({transactions, onExpenseIncome}) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const result = prepareIncomeLineChartData(transactions);
        setChartData(result);

        return () => {};
    }, [transactions]);

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div className="">
                    <h5 className="text-lg">Tổng quan chi tiêu</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Theo dõi chi tiêu và xem chi tiết tiền của bạn đi đâu.
                    </p>
                </div>

                <button className="add-btn" onClick={onExpenseIncome}>
                    <Plus size={15} className="text-lg" />Thêm chi tiêu</button>
            </div>

            <div className="mt-10">
                <CustomLineChart data={chartData} />
            </div>
        </div>
    );
};

export default ExpenseOverview;
