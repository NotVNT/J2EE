import { ArrowRight } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import moment from "moment";

const RecentTransactions = ({ transactions, onMore }) => {
  return (
    <div className="card text-slate-900">
      <div className="flex items-center justify-between">
        <h4 className="text-lg">Giao dịch gần đây</h4>

        <button className="card-btn" onClick={onMore}>
          Xem thêm <ArrowRight className="text-base" size={15} />
        </button>
      </div>

      <div className="mt-6">
        {transactions?.slice(0, 5)?.map((item) => (
          <TransactionInfoCard
            key={item.id}
            title={item.name}
            icon={item.icon}
            date={moment(item.date).format("DD/MM/YYYY")}
            amount={item.amount}
            type={item.type}
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
