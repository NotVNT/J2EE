import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, Settings, LogOut, Package } from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const AdminLayout = () => {
  const { clearUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    clearUser();
    navigate("/login");
  };

  const NavItem = ({ to, icon: Icon, label, exact }) => {
    const isActive = exact
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`);
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
          }`}
      >
        <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-500"} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="w-64 flex flex-col bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" exact />
          <NavItem to="/admin/payments" icon={Wallet} label="Payments" />
          <NavItem to="/admin/subscriptions" icon={Package} label="Subscriptions" />
          <NavItem to="/admin/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition"
          >
            <LogOut size={20} className="text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
