import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";

const LoginPlaceholder = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-3xl justify-center px-6 py-20">
        <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white/85 p-10 shadow-2xl shadow-slate-200/80 backdrop-blur">
          <h1 className="text-3xl font-semibold">Login module comes next</h1>
          <p className="mt-4 text-slate-600">
            This step only introduces the signup flow. The login page is left as a placeholder so
            navigation remains valid.
          </p>
          <Link className="mt-8 inline-block text-sm font-medium text-blue-600" to="/signup">
            Back to signup
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LoginPlaceholder;
