import { Link } from "react-router-dom";
import devbotLogo from "../../assets/logo/devbot.png";

const LandingNavbar = () => {
  return (
    <header className="flex items-center justify-between pb-8 sm:pb-12">
      <Link to="/home" className="inline-flex items-center" aria-label="Go to home page">
        <img src={devbotLogo} alt="Devbot logo" className="h-10 w-auto object-contain" />
      </Link>

      <nav className="flex items-center gap-3 text-sm sm:gap-4 sm:text-base">
        <Link
          to="/login"
          className="rounded-full border border-lime-300/30 px-4 py-2 font-medium text-lime-100 transition hover:border-lime-300 hover:text-lime-300"
        >
          Đăng Nhập
        </Link>
        <Link
          to="/signup"
          className="rounded-full bg-lime-300 px-4 py-2 font-semibold text-neutral-900 transition hover:bg-lime-200"
        >
          Đăng Ký
        </Link>
      </nav>
    </header>
  );
};

export default LandingNavbar;
