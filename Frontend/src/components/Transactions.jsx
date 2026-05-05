import {ArrowRight} from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import moment from "moment";

const Transactions = ({transactions, onMore, type, title}) => {
    return (
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border-none h-full">
            <div className="p-8 pb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">{title}</h3>
                <button className="text-secondary text-sm font-bold hover:underline flex items-center gap-1" onClick={onMore}>
                    Xem thêm <ArrowRight className="text-sm" size={15}/>
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low/50">
                            <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tên giao dịch</th>
                            <th className="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Ngày</th>
                            <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                        {transactions?.slice(0, 5)?.map((item, index) => {
                            // If type prop is passed, use it, else fallback to item.type
                            const txType = type || item.type;
                            const isExpense = txType === "expense";
                            const colorClass = isExpense ? "text-error" : "text-green-600";
                            const bgClass = isExpense ? "bg-orange-100" : "bg-green-100";
                            const prefix = isExpense ? "-" : "+";
                            const amountStr = item.amount ? item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";

                            return (
                                <tr key={item.id || index} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
                                                <span className={`material-symbols-outlined ${colorClass}`}>{item.icon || (isExpense ? "receipt_long" : "payments")}</span>
                                            </div>
                                            <span className="font-bold text-on-surface">{item.name || item.title || "Giao dịch"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-sm text-on-surface-variant whitespace-nowrap">
                                        {moment(item.date).format('DD/MM/YYYY')}
                                    </td>
                                    <td className={`px-8 py-5 text-right font-bold ${colorClass} whitespace-nowrap`}>
                                        {prefix} {amountStr}đ
                                    </td>
                                </tr>
                            );
                        })}
                        {(!transactions || transactions.length === 0) && (
                            <tr>
                                <td colSpan="3" className="px-8 py-8 text-center text-on-surface-variant">
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

export default Transactions;