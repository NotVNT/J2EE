import {useEffect, useState} from "react";
import {prepareIncomeLineChartData} from "../util/util.js";
import CustomLineChart from "./CustomLineChart.jsx";
import {Plus} from "lucide-react";

const IncomeOverview = ({transactions, onAddIncome}) => {
    const [chartData, setChartData] = useState([]);
    useEffect(() => {
        const result = prepareIncomeLineChartData(transactions);
        console.log(result);
        setChartData(result);

        return () => {};
    }, [transactions]);
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-lg">Tổng quan thu nhập</h5>
                    <p className="text-xs text-gray-400 mt-0 5">Theo dõi và phân tích xu hướng thu nhập của bạn.</p>
                </div>
                <button className="add-btn" onClick={onAddIncome}>
                    <Plus size={15} className="text-lg" />Thêm thu nhập</button>
            </div>
            <div className="mt-10">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center p-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        Chưa có dữ liệu cho khoảng thời gian này
                    </div>
                ) : (
                    <CustomLineChart data={chartData} />
                )}
            </div>
        </div>
    )
}

export default IncomeOverview;