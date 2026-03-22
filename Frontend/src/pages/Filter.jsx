import Dashboard from "../components/Dashboard.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {Search} from "lucide-react";
import {useState} from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import TransactionInfoCard from "../components/TransactionInfoCard.jsx";
import moment from "moment";

const Filter = () => {
    useUser();
    const [type, setType] = useState("income");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [keyword, setKeyword] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState("asc");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.APPLY_FILTERS, {
                type,
                startDate,
                endDate,
                keyword,
                sortField,
                sortOrder
            });
            console.log('transactions: ', response.data);
            setTransactions(response.data);
        }catch (error) {
            console.error('Failed to fetch transactions: ', error);
            toast.error(error.message || "Lỗi khi tải giao dịch. Vui lòng thử lại");
        }finally {
            setLoading(false);
        }

    }

    return (
        <Dashboard activeMenu="Bộ lọc">
            <div className="my-5 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Lọc giao dịch</h2>
                </div>
                <div className="card p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold">Chọn các bộ lọc</h5>
                    </div>
                    <form className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="type">Loại</label>
                            <select value={type} id="type" className="w-full border rounded px-3 py-2" onChange={e => setType(e.target.value)}>
                                <option value="income">Thu nhập</option>
                                <option value="expense">Chi tiêu</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startdate" className="block text-sm font-medium mb-1">Từ ngày</label>
                            <input value={startDate} id="startdate" type="date" className="w-full border rounded px-3 py-2" onChange={e => setStartDate(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor="enddate" className="block text-sm font-medium mb-1">Đến ngày</label>
                            <input value={endDate} id="enddate" type="date" className="w-full border rounded px-3 py-2" onChange={e => setEndDate(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor="sortfield" className="block text-sm font-medium mb-1">Sắp xếp theo</label>
                            <select value={sortField} id="sortfield" className="w-full border rounded px-3 py-2" onChange={e => setSortField(e.target.value)}>
                                <option value="date">Ngày</option>
                                <option value="amount">Số tiền</option>
                                <option value="category">Danh mục</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortorder" className="block text-sm font-medium mb-1">Thứ tự</label>
                            <select value={sortOrder} id="sortorder" className="w-full border rounded px-3 py-2" onChange={e => setSortOrder(e.target.value)}>
                                <option value="asc">Tăng dần</option>
                                <option value="desc">Giảm dần</option>
                            </select>
                        </div>
                        <div className="sm:col-span-1 md:col-span-1 flex items-end">
                            <div className="w-full">
                                <label htmlFor="keyword" className="block text-sm font-medium mb-1">Tìm kiếm</label>
                                <input value={keyword} id="keyword" type="text" placeholder="Tìm kiếm..." className="w-full border rounded px-3 py-2" onChange={e => setKeyword(e.target.value)} />
                            </div>
                            <button onClick={handleSearch} className="ml-2 mb-1 p-2 bg-purple-800 hover:bg-purple-800 text-white rounded flex items-center justify-center cursor-pointer">
                                <Search size={20} />
                            </button>
                        </div>
                    </form>
                </div>
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold">Giao dịch</h5>
                    </div>
                    {transactions.length === 0 && !loading? (
                        <p className="text-gray-500">Chọn bộ lọc và nhấn tìm kiếm để phân tích dữ liệu giao dịch</p>
                    ): ""}
                    {loading ? (
                        <p className="text-gray-500">Đang tải giao dịch...</p>
                    ): ("")}
                    {transactions.map((transaction) => (
                        <TransactionInfoCard
                            key={transaction.id}
                            title={transaction.name}
                            icon={transaction.icon}
                            date={moment(transaction.date).format('DD/MM/YYYY')}
                            amount={transaction.amount}
                            type={type}
                            hideDeleteBtn
                        />
                    ))}
                </div>
            </div>
        </Dashboard>
    )
}

export default Filter;