import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";

const DashboardPlaceholder = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useContext(AppContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-4xl justify-center px-6 py-20">
        <div className="w-full rounded-[2rem] border border-white/70 bg-white/85 p-10 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <h1 className="text-3xl font-semibold">Login successful</h1>
          <p className="mt-4 text-slate-600">
            This is a dashboard placeholder for the login step. The real dashboard module can be
            added later in another history step.
          </p>
          <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-6 text-sm text-slate-700">
            <p>
              <strong>Stored token:</strong> {localStorage.getItem("token") ? "yes" : "no"}
            </p>
            <p>
              <strong>User in context:</strong> {user?.email || "not loaded in this placeholder"}
            </p>
          </div>
          <button
            className="mt-8 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPlaceholder;
