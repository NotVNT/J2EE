import { useEffect, useState } from "react";
import {ImageUp, LoaderCircle, Plus} from "lucide-react";
import CustomLineChart from "./CustomLineChart.jsx";
import {prepareIncomeLineChartData} from "../util/util.js";

const ExpenseOverview = ({transactions, onExpenseIncome, onImportReceipt, isImportingReceipt = false}) => {
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

                <div className="flex items-center gap-2">
                    <button
                        className="add-btn disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={onImportReceipt}
                        disabled={!onImportReceipt || isImportingReceipt}
                        type="button"
                    >
                        {isImportingReceipt ? (
                            <>
                                <LoaderCircle size={15} className="text-lg animate-spin" />Đang quét hóa đơn...
                            </>
                        ) : (
                            <>
                                <ImageUp size={15} className="text-lg" />Kiểm tra hóa đơn
                            </>
                        )}
                    </button>
                    <button className="add-btn" onClick={onExpenseIncome}>
                        <Plus size={15} className="text-lg" />Thêm chi tiêu
                    </button>
                </div>
            </div>

            <div className="mt-10">
                <CustomLineChart data={chartData} />
            </div>
        </div>
    );
};

export default ExpenseOverview;
