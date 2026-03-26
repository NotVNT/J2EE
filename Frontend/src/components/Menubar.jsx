import { useState, useRef, useEffect, useContext } from "react";
import {User, LogOut, X, Menu, Crown} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {assets} from "../assets/assets.js";
import {AppContext} from "../context/AppContext.jsx";
import Sidebar from "./Sidebar.jsx";

const Menubar = ({ activeMenu, isVip }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { clearUser, user } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleOpenProfile = () => {
        setShowDropdown(false);
        navigate("/profile");
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        clearUser();
        setShowDropdown(false);
        navigate("/login");
    };

    return (
        <div className={`flex items-center justify-between gap-5 border border-b backdrop-blur-[2px] py-4 px-4 sm:px-7 sticky top-0 z-30 ${
            isVip
                ? "vip-menubar border-amber-500/20"
                : "bg-white border-gray-200/50"
        }`}>
            <div className="flex items-center gap-5">
                <button
                    className={`block lg:hidden p-1 rounded transition-colors ${
                        isVip ? "text-amber-200 hover:bg-amber-500/10" : "text-black hover:bg-gray-100"
                    }`}
                    onClick={() => {
                        setOpenSideMenu(!openSideMenu);
                    }}
                >
                    {openSideMenu ? (
                        <X className="text-2xl" />
                    ) : (
                        <Menu className="text-2xl" />
                    )}
                </button>

                <Link to="/dashboard" className="flex items-center gap-2" aria-label="Go to home page">
                    <img src={assets.logo} alt="Devbot logo" className="h-10 w-auto object-contain" />
                    {isVip && (
                        <span className="vip-crown" title="VIP Premium">
                            <Crown size={14} className="text-white" />
                        </span>
                    )}
                </Link>
            </div>

            <div className="relative flex items-center gap-3" ref={dropdownRef}>
                {isVip && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-200 bg-amber-500/15 border border-amber-500/25">
                        <Crown size={12} />
                        PREMIUM
                    </span>
                )}

                <button
                    onClick={toggleDropdown}
                    className={`vip-avatar-btn flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isVip
                            ? "focus:ring-amber-500"
                            : "bg-gray-100 hover:bg-gray-200 focus:ring-purple-800"
                    }`}
                >
                    {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="profile" className="w-10 h-10 rounded-full object-cover"/>
                    ) : (
                        <User className={`w-6 h-6 ${isVip ? "text-amber-400" : "text-gray-500"}`}/>
                    )}
                </button>

                {showDropdown && (
                    <div className={`vip-dropdown absolute right-0 mt-2 w-52 rounded-lg shadow-lg border py-1 z-50 top-full ${
                        isVip
                            ? "bg-[#1e1a2e] border-amber-500/20"
                            : "bg-white border-gray-200"
                    }`}>
                        <div className={`px-4 py-3 border-b vip-dropdown-border ${
                            isVip ? "border-amber-500/12" : "border-gray-100"
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full overflow-hidden ${
                                    isVip ? "bg-amber-500/10 ring-1 ring-amber-500/30" : "bg-gray-100"
                                }`}>
                                    {user?.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className={`w-4 h-4 ${isVip ? "text-amber-400" : "text-purple-600"}`}/>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate vip-dropdown-name ${
                                        isVip ? "text-amber-100" : "text-gray-900"
                                    }`}>
                                        {user?.fullName || "Người dùng"}
                                    </p>
                                    <p className={`text-xs truncate vip-dropdown-email ${
                                        isVip ? "text-amber-500/60" : "text-gray-500"
                                    }`}>{user?.email || ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-1">
                            <button
                                onClick={handleOpenProfile}
                                className={`vip-dropdown-item flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors duration-150 ${
                                    isVip ? "text-amber-100/80 hover:bg-amber-500/8" : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <User className={`w-4 h-4 vip-dropdown-icon ${isVip ? "text-amber-400" : "text-gray-500"}`} />
                                <span className="vip-dropdown-text">Hồ sơ cá nhân</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`vip-dropdown-item flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors duration-150 ${
                                    isVip ? "text-amber-100/80 hover:bg-amber-500/8" : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <LogOut className={`w-4 h-4 vip-dropdown-icon ${isVip ? "text-amber-400" : "text-gray-500"}`} />
                                <span className="vip-dropdown-text">Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {openSideMenu && (
                <div className={`vip-mobile-sidebar fixed top-[73px] left-0 right-0 border-b lg:hidden z-20 ${
                    isVip ? "bg-[#1a1625] border-amber-500/12" : "bg-white border-gray-200"
                }`}>
                    <Sidebar activeMenu={activeMenu} isVip={isVip} />
                </div>
            )}
        </div>
    );
};

export default Menubar;
