import { useState, useRef, useEffect, useContext } from "react";
import {User, LogOut, X, Menu} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {assets} from "../assets/assets.js";
import {AppContext} from "../context/AppContext.jsx";
import Sidebar from "./Sidebar.jsx";

const Menubar = ({ activeMenu }) => {
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
        <header className="fixed top-0 right-0 lg:w-[calc(100%-16rem)] w-full h-20 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-4 lg:px-8 font-['Plus_Jakarta_Sans'] text-sm shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <button
                    className="block lg:hidden text-on-surface-variant hover:bg-slate-100 p-2 rounded-xl transition-colors"
                    onClick={() => setOpenSideMenu(!openSideMenu)}
                >
                    {openSideMenu ? <X className="text-2xl" /> : <Menu className="text-2xl" />}
                </button>
                <div className="relative w-full max-w-md hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none" placeholder="Tìm kiếm giao dịch, báo cáo..." type="text"/>
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-4">
                    <button className="relative flex items-center justify-center w-10 h-10 bg-surface-container hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-primary transition-colors duration-200 hidden sm:flex focus:outline-none ring-2 ring-transparent focus:ring-secondary/50">
                        <span className="material-symbols-outlined text-[20px]" data-icon="notifications">notifications</span>
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container"></span>
                    </button>
                    <button onClick={() => navigate("/expense")} className="hidden md:flex bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all items-center gap-2 shadow-lg shadow-primary/10">
                        <span className="material-symbols-outlined text-xl">add</span>
                        Thêm giao dịch
                    </button>
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center justify-center w-10 h-10 bg-surface-container hover:bg-surface-container-high
                        rounded-full transition-colors duration-200 focus:outline-none ring-2 ring-transparent focus:ring-secondary/50"
                    >
                        {user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="profile" className="w-10 h-10 rounded-full object-cover"/>
                        ) : (
                            <User className="w-5 h-5 text-on-surface-variant"/>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-3 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                            <div className="px-5 py-4 border-b border-slate-100 bg-surface-container-lowest rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-surface-container rounded-full overflow-hidden">
                                        {user?.profileImageUrl ? (
                                            <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-primary"/>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <p className="text-sm font-bold text-on-surface truncate">
                                                {user?.fullName || "Người dùng"}
                                            </p>
                                        </div>
                                        <p className="text-xs text-on-surface-variant truncate">{user?.email || ""}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2 px-2">
                                <button
                                    onClick={handleOpenProfile}
                                    className="flex flex-row items-center justify-start gap-3 w-full px-3 py-2.5 text-sm font-medium text-on-surface-variant
                                     hover:bg-surface-container hover:text-primary rounded-xl transition-colors duration-150"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Hồ sơ cá nhân</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex flex-row items-center justify-start gap-3 w-full px-3 py-2.5 text-sm font-medium text-error
                                     hover:bg-error/10 rounded-xl transition-colors duration-150 mt-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {openSideMenu && (
                <div className="fixed top-[80px] left-0 right-0 bg-white border-b border-gray-200 lg:hidden z-20">
                    <Sidebar activeMenu={activeMenu} />
                </div>
            )}
        </header>
    );
};

export default Menubar;
