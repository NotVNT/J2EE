import CustomPieChart from "./CustomPieChart.jsx";
import {addThousandsSeparator} from "../util/util.js";

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    const balanceData = [
        { name: "Tiết kiệm", amount: totalBalance * 0.45 },
        { name: "Đầu tư", amount: totalBalance * 0.3 },
        { name: "Tiền mặt", amount: totalBalance * 0.15 },
        { name: "Dự phòng", amount: totalBalance * 0.1 },
    ];
    
    // #6100c6 is purple, #1a237e is deep blue, #00c853 is green, #ff9100 is orange
    const COLORS = ["#0b143a", "#2b0b5c", "#0A7A38", "#A65D0A"]; // Matches new dark aesthetic

    const formatCurrencyStr = (num) => {
        return addThousandsSeparator(Math.floor(num));
    };
    return (
        <div className="bg-white p-8 rounded-[1.5rem] shadow-[0_2px_10px_0_rgba(25,28,30,0.02)] border border-[#E5E7EB]/50 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#191c1e]">Cơ cấu tài chính</h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 mt-4">
                <div className="w-full h-full flex items-center justify-center min-h-[220px]">
                    <CustomPieChart
                        data={balanceData}
                        label="Tổng"
                        totalAmount={`${formatCurrencyStr(totalBalance)}`}
                        colors={COLORS}
                        showTextAnchor
                        small
                    />
                </div>
            </div>

            {/* Manual Modern Legend */}
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
                {balanceData.map((item, index) => {
                    const totalForPercent = Math.max(1, balanceData.reduce((sum, d) => sum + d.amount, 0));
                    const percent = Math.round((item.amount / totalForPercent) * 100);
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span className="text-sm font-medium text-[#191c1e]/70">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-[#191c1e]">{percent}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default FinanceOverview;