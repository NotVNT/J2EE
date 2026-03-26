import {useContext} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {Crown, User} from "lucide-react";
import {SIDE_BAR_DATA} from "../assets/assets.js";
import {useNavigate} from "react-router-dom";

const Sidebar = ({activeMenu, isVip}) => {
    const {user} = useContext(AppContext);
    const navigate = useNavigate();

    return (
        <div className={`w-64 h-[calc(100vh-61px)] p-5 sticky top-[61px] z-20 ${
            isVip ? "vip-sidebar" : "bg-white border-gray-200/50"
        }`}>
            <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
                {user?.profileImageUrl ? (
                    <div className={`relative ${isVip ? "animate-[vip-float_3s_ease-in-out_infinite]" : ""}`}>
                        <img
                            src={user.profileImageUrl}
                            alt="profile image"
                            className={`w-20 h-20 rounded-full object-cover ${
                                isVip
                                    ? "ring-2 ring-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                    : "bg-slate-400"
                            }`}
                        />
                    </div>
                ) : (
                    <User className={`w-20 h-20 text-xl ${isVip ? "text-amber-400" : ""}`} />
                )}
                <h5 className={`font-medium leading-6 ${isVip ? "vip-user-name" : "text-gray-950"}`}>
                    {user.fullName || ""}
                </h5>
                {isVip && (
                    <span className="vip-badge">
                        <Crown size={12} />
                        VIP Premium
                    </span>
                )}
            </div>
            {SIDE_BAR_DATA.map((item, index) => (
                <button
                    onClick={() => navigate(item.path)}
                    key={`menu_${index}`}
                    className={`cursor-pointer w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 ${
                        isVip
                            ? activeMenu === item.label
                                ? "vip-menu-active"
                                : "vip-menu-btn"
                            : activeMenu === item.label
                                ? "text-white bg-purple-800"
                                : ""
                    }`}
                >
                    <item.icon className="text-xl" />
                    {item.label}
                </button>
            ))}
        </div>
    )
}

export default Sidebar;
