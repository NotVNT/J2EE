import { Link } from "react-router-dom";
import {
  Cookie,
  Database,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
  WalletCards,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { useTranslation } from "../hooks/useTranslation.js";

const privacySections = [
  {
    title: "Thông tin chúng tôi thu thập",
    icon: UserCheck,
    items: [
      "Thông tin tài khoản như họ tên, email và trạng thái xác thực để tạo và bảo vệ tài khoản.",
      "Dữ liệu tài chính do bạn nhập, gồm thu nhập, chi tiêu, danh mục, ngân sách, hũ chi tiêu, mục tiêu tiết kiệm và báo cáo.",
      "Dữ liệu sử dụng cơ bản như thời điểm đăng nhập, tùy chọn ngôn ngữ, chủ đề giao diện và tương tác trong ứng dụng.",
    ],
  },
  {
    title: "Cách chúng tôi sử dụng thông tin",
    icon: WalletCards,
    items: [
      "Cung cấp các chức năng quản lý tài chính cá nhân, theo dõi giao dịch, lập ngân sách và báo cáo.",
      "Hỗ trợ phân tích bằng AI để gợi ý xu hướng chi tiêu, dự báo và tổng hợp thông tin tài chính cho bạn.",
      "Cải thiện trải nghiệm, độ ổn định, bảo mật và chất lượng hỗ trợ khách hàng.",
    ],
  },
  {
    title: "Bảo mật dữ liệu",
    icon: LockKeyhole,
    items: [
      "Money Manager sử dụng HTTPS, JWT và cookie HttpOnly để giảm rủi ro lộ token xác thực.",
      "Dữ liệu được lưu trữ trong các hệ thống phù hợp như MySQL, MongoDB, Redis và các dịch vụ lưu trữ an toàn.",
      "Chúng tôi không bán dữ liệu cá nhân hoặc dữ liệu tài chính của bạn cho bên thứ ba.",
    ],
  },
  {
    title: "Quyền của bạn",
    icon: ShieldCheck,
    items: [
      "Bạn có thể xem, cập nhật hoặc chỉnh sửa thông tin tài khoản và dữ liệu tài chính của mình trong ứng dụng.",
      "Bạn có thể yêu cầu xóa tài khoản, xóa dữ liệu liên quan hoặc xuất dữ liệu khi tính năng này được hỗ trợ.",
      "Bạn có thể liên hệ đội ngũ hỗ trợ nếu cần kiểm tra, điều chỉnh hoặc làm rõ cách dữ liệu được xử lý.",
    ],
  },
  {
    title: "Cookie và token",
    icon: Cookie,
    items: [
      "Money Manager dùng cookie HttpOnly mm_token để duy trì phiên đăng nhập và xác thực yêu cầu.",
      "Cookie xác thực không được dùng để bán quảng cáo hoặc theo dõi bạn trên các website khác.",
      "Bạn có thể đăng xuất để kết thúc phiên và trình duyệt sẽ xóa hoặc vô hiệu hóa token đăng nhập theo cấu hình hệ thống.",
    ],
  },
  {
    title: "Dịch vụ bên thứ ba",
    icon: Sparkles,
    items: [
      "Google Gemini có thể được dùng cho các tính năng AI như phân tích, dự báo và trò chuyện tài chính.",
      "PayOS có thể được dùng để xử lý thanh toán gói dịch vụ, gia hạn hoặc nâng cấp tài khoản.",
      "AWS S3 có thể được dùng để lưu trữ tệp, ảnh hoặc tài liệu bạn tải lên.",
      "Brevo có thể được dùng để gửi email xác thực, thông báo tài khoản và thông tin hỗ trợ.",
    ],
  },
  {
    title: "Thay đổi chính sách",
    icon: Database,
    items: [
      "Chúng tôi có thể cập nhật chính sách này khi sản phẩm, yêu cầu pháp lý hoặc biện pháp bảo mật thay đổi.",
      "Các thay đổi quan trọng sẽ được thông báo qua email, trong ứng dụng hoặc trên trang này trước khi áp dụng khi phù hợp.",
    ],
  },
];

const Privacy = () => {
  const { translate } = useTranslation();
  usePageTitle(translate("Chính sách bảo mật"));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A]">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                <ShieldCheck size={15} />
                Quyền riêng tư
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Chính sách bảo mật
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                Money Manager cam kết bảo vệ quyền riêng tư và dữ liệu tài chính cá nhân của bạn. Chính sách này giải thích những thông tin chúng tôi thu thập, cách sử dụng, cách bảo vệ và quyền kiểm soát dữ liệu của bạn.
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Cập nhật lần cuối: 18/06/2026
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-5">
            {privacySections.map(({ title, icon: Icon, items }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                      {title}
                    </h2>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                      {items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Mail size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  Liên hệ
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                  Nếu bạn có câu hỏi về quyền riêng tư, bảo mật hoặc yêu cầu liên quan đến dữ liệu cá nhân, vui lòng liên hệ đội ngũ hỗ trợ qua kênh hỗ trợ chính thức của Money Manager.
                </p>
              </div>
            </div>
          </div>

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

export default Privacy;
