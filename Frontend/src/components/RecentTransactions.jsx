import {ArrowRight} from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import moment from "moment";

const RecentTransactions = ({transactions, onMore}) => {
    return(
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(25,28,30,0.02)] border border-[#E5E7EB]/50 flex-1 flex flex-col cursor-pointer">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#191c1e]">Giao dịch gần đây</h3>
                <button onClick={onMore} className="text-[#2563eb] text-sm font-bold hover:text-blue-700 transition-colors uppercase tracking-widest">
                    Xem tất cả
                </button>
            </div>
            
            <div className="flex-1 overflow-x-auto min-w-full">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low/50">
                            <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tên giao dịch</th>
                            <th className="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Ngày</th>
                            <th className="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest hidden sm:table-cell">Danh mục</th>
                            <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                        {transactions?.slice(0, 5)?.map((item, index) => {
                            const isExpense = item.type === "expense";
                            const colorClass = isExpense ? "text-error" : "text-green-600";
                            const bgClass = isExpense ? "bg-orange-100" : "bg-green-100";
                            const prefix = isExpense ? "-" : "+";
                            const amountStr = item.amount ? item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";

                            return (
                                <tr key={item.id || index} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center overflow-hidden p-1.5 shadow-sm border border-[#E5E7EB]/30`}>
                                                {item.icon && (item.icon.startsWith("data:image/") || item.icon.startsWith("http")) ? (
                                                    <img src={item.icon} alt="" className="w-full h-full object-contain rounded-md" />
                                                ) : (
                                                    <span className={`material-symbols-outlined ${colorClass} !text-[20px]`}>
                                                        {item.icon || (isExpense ? "receipt_long" : "payments")}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-bold text-[#191c1e]">{item.name || item.title || "Giao dịch"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-sm text-on-surface-variant whitespace-nowrap">
                                        {moment(item.date).format('DD/MM/YYYY')}
                                    </td>
                                    <td className="px-4 py-5 hidden sm:table-cell">
                                        <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-on-surface-variant uppercase truncate max-w-[100px] inline-block">
                                            {item.category || item.type}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-5 text-right font-bold ${colorClass} whitespace-nowrap`}>
                                        {prefix} {amountStr}đ
                                    </td>
                                </tr>
                            );
                        })}
                        {(!transactions || transactions.length === 0) && (
                            <tr>
                                <td colSpan="4" className="px-8 py-8 text-center text-on-surface-variant">
                                    Chưa có giao dịch nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RecentTransactions;