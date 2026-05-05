import {useContext} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {User} from "lucide-react";
import {SIDE_BAR_DATA} from "../assets/assets.js";
import {useNavigate} from "react-router-dom";

const Sidebar = ({activeMenu}) => {
    const {user} = useContext(AppContext);
    const navigate = useNavigate();
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-[#F4F6F8] flex lg:flex flex-col p-6 gap-2 font-['Inter'] text-sm tracking-tight border-r border-[#E5E7EB] z-50">
            <div className="text-2xl font-black text-[#1a237e] tracking-tighter mb-8 cursor-pointer flex items-center gap-2" onClick={() => navigate("/dashboard")}>
                Money Manager
            </div>
            
            <div className="flex items-center gap-3 mb-8 p-1">
                <div className="relative">
                    {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="profile" className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                            <User className="w-5 h-5" />
                        </div>
                    )}
                    {user?.subscriptionPlan === "PREMIUM" && (
                        <span className="absolute -bottom-1 -right-1 bg-secondary text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm uppercase">PRO</span>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-on-surface truncate">{user?.fullName || "Người dùng"}</p>
                    <p className="text-xs text-on-surface-variant/70 truncate">{user?.subscriptionPlan === "PREMIUM" ? "Tài khoản Premium" : "Tài khoản Basic"}</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
                {SIDE_BAR_DATA.map((item, index) => {
                    const isActive = activeMenu === item.label;
                    return (
                        <button
                            onClick={() => navigate(item.path)}
                            key={`menu_${index}`}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive 
                                ? "bg-white text-[#2563eb] font-bold shadow-sm"
                                : "text-slate-500 font-medium hover:text-[#1a237e] hover:bg-white/50"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-[#2563eb]" : "text-slate-400"}`} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    )
}

export default Sidebar;
