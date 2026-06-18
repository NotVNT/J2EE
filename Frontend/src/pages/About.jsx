import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
  WalletCards,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { useTranslation } from "../hooks/useTranslation.js";

const features = [
  {
    icon: WalletCards,
    title: "Quản lý thu chi",
    description:
      "Ghi nhận mọi khoản thu nhập và chi tiêu, phân loại theo danh mục để nắm rõ dòng tiền mỗi ngày.",
  },
  {
    icon: Wallet,
    title: "Lập ngân sách",
    description:
      "Thiết lập hạn mức chi tiêu cho từng danh mục và nhận cảnh báo khi sắp vượt mức.",
  },
  {
    icon: Target,
    title: "Mục tiêu tiết kiệm",
    description:
      "Đặt mục tiêu tài chính, đóng góp đều đặn và theo dõi tiến độ tích lũy theo thời gian.",
  },
  {
    icon: PiggyBank,
    title: "Hũ chi tiêu",
    description:
      "Phân bổ thu nhập vào các hũ theo phương pháp 6 hũ tài chính, giúp quản lý tiền hiệu quả hơn.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo & Thống kê",
    description:
      "Xem biểu đồ tổng quan, so sánh thu chi theo tuần, tháng và phân tích xu hướng tài chính.",
  },
  {
    icon: Bot,
    title: "Trợ lý AI Nova Money",
    description:
      "Nhận phân tích chi tiêu thông minh, dự báo dòng tiền và thực hiện thao tác bằng ngôn ngữ tự nhiên.",
  },
];

const About = () => {
  const { translate } = useTranslation();
  usePageTitle(translate("Giới thiệu"));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A]">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                <Sparkles size={15} />
                Giới thiệu
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Money Manager
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                Ứng dụng quản lý tài chính cá nhân toàn diện — giúp bạn theo dõi thu chi, lập ngân sách, thiết lập mục tiêu tiết kiệm và nhận phân tích thông minh từ trợ lý AI Nova Money. Hỗ trợ cả nền tảng Web và Mobile.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
            Tính năng nổi bật
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, icon: Icon, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </article>
            ))}
          </div>

          {/* Privacy Policy card */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">
                    Chính sách bảo mật
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.
                  </p>
                </div>
              </div>
              <Link
                to="/privacy"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shrink-0"
              >
                Xem chính sách <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/home"
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
