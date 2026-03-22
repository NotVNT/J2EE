import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Header = () => {
  return (
    <header className="border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/home" className="inline-flex items-center" aria-label="Go to home page">
          <img src={assets.logo} alt="Devbot logo" className="h-10 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/signup"
            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            Đăng ký
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
          >
            Đăng nhập
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
