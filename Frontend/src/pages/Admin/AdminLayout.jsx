import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, Settings, LogOut, Package, Menu, X, ArrowLeft, Sun, Moon, Bell, Users } from "lucide-react";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import Footer from "../../components/Footer.jsx";
import LanguageToggle from "../../components/LanguageToggle.jsx";
import { useTranslation } from "../../hooks/useTranslation.js";
import axiosConfig from "../../util/axiosConfig";
import { API_ENDPOINTS } from "../../util/apiEndpoints";

const AdminLayout = () => {
  const { clearUser } = useContext(AppContext);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosConfig.post(API_ENDPOINTS.LOGOUT);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearUser();
      navigate("/login");
    }
  };

  const NavItem = ({ to, icon: Icon, label, exact, onClick }) => {
    const isActive = exact
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium hover:translate-x-1"
        }`}
      >
        <Icon size={20} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"} />
        <span>{label}</span>
      </Link>
    );
  };

  const closeSidebar = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
        <div className="flex items-center justify-between">
          {/* Logo + Branding */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/favicon.png"
                alt="Money Manager Logo"
                className="w-12 h-12 rounded-2xl object-cover shadow-md shadow-violet-500/20"
              />
              {/* Admin badge overlay */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white dark:border-[#0F172A] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
                  <path d="M4 1L5.2 3H7L5.6 4.8L6.2 7L4 5.8L1.8 7L2.4 4.8L1 3H2.8L4 1Z" fill="white"/>
                </svg>
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight whitespace-nowrap">
                Admin Dashboard
              </p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                Money Manager
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
            onClick={closeSidebar}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem to="/admin" icon={LayoutDashboard} label={t("admin.dashboard")} exact onClick={closeSidebar} />
        <NavItem to="/admin/users" icon={Users} label={t("admin.users")} onClick={closeSidebar} />
        <NavItem to="/admin/payments" icon={Wallet} label={t("admin.payments")} onClick={closeSidebar} />
        <NavItem to="/admin/subscriptions" icon={Package} label={t("admin.subscription")} onClick={closeSidebar} />
        <NavItem to="/admin/notifications" icon={Bell} label={t("admin.notifications")} onClick={closeSidebar} />
        <NavItem to="/admin/settings" icon={Settings} label={t("admin.settings")} onClick={closeSidebar} />
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-white/10 space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{t("admin.back")}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} className="text-red-500 dark:text-red-400" />
          <span className="font-medium">{t("admin.logout")}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0A0E1A] font-sans text-slate-800 dark:text-slate-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-white/10">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
          />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0F172A]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {/* Mobile: show logo on small screens */}
            <div className="flex lg:hidden items-center gap-2.5">
              <img src="/favicon.png" alt="logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg lg:text-xl font-extrabold text-slate-800 dark:text-white">
                {location.pathname === "/admin" && t("admin.dashboardTitle")}
                {location.pathname.startsWith("/admin/users") && t("admin.users")}
                {location.pathname.startsWith("/admin/payments") && t("admin.payments")}
                {location.pathname.startsWith("/admin/subscriptions") && t("admin.subscription")}
                {location.pathname.startsWith("/admin/notifications") && t("admin.notifications")}
                {location.pathname.startsWith("/admin/settings") && t("admin.settings")}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title={theme === "dark" ? t("admin.themeLight") : t("admin.themeDark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
            >
              <LogOut size={16} />
              {t("admin.logout")}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
