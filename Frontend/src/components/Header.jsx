import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/signup" className="text-lg font-semibold tracking-tight text-slate-900">
          Money Manager
        </Link>
        <nav className="flex items-center gap-5 text-sm text-slate-600">
          <Link to="/signup" className="hover:text-slate-900">
            Signup
          </Link>
          <Link to="/login" className="hover:text-slate-900">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
