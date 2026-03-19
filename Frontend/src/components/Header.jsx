import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Header = () => {
  return (
    <header className="border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/home" className="inline-flex items-center" aria-label="Go to home page">
          <img src={assets.logo} alt="Devbot logo" className="h-10 w-auto object-contain" />
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
