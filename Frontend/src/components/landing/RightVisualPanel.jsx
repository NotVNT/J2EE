import DealsCard from "./DealsCard.jsx";

const RightVisualPanel = () => {
  return (
    <section className="relative rounded-3xl border border-lime-200/20 bg-gradient-to-b from-lime-300/5 to-transparent p-4 sm:p-6 lg:min-h-[620px]">
      <DealsCard />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-lime-300/20 bg-white/5 p-4">
          <p className="text-3xl font-semibold text-lime-300">20k</p>
          <p className="mt-2 text-sm text-lime-50/70">Doanh nghiệp đã tham gia cùng chúng tôi.</p>
        </article>

        <article className="rounded-2xl bg-white p-4 text-neutral-900">
          <p className="text-2xl font-bold">1000+</p>
          <p className="mt-1 text-sm">Đánh giá người dùng</p>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-lime-300/20 bg-white/5 p-4">
        <p className="text-sm leading-relaxed text-lime-50/80">
          Devbot là nền tảng đơn giản giúp bạn làm rõ tài chính cá nhân mỗi ngày.
          Đăng ký ngay để trải nghiệm đầy đủ các tính năng.
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-lime-300">
          Tạo tài khoản →
        </p>
      </article>

      <article className="mt-4 rounded-3xl border border-lime-300/20 bg-black/35 p-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-lime-300">Chi tiêu cá nhân hoá</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Gợi ý ngân sách theo thói quen chi tiêu</h3>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-lime-300/20 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wider text-lime-200/80">Ăn uống</p>
            <p className="mt-1 text-sm text-lime-50/80">Bạn đang vượt ngân sách 12% tuần này. Đề xuất giới hạn còn <span className="font-semibold text-white">1.200.000đ</span>.</p>
          </div>

          <div className="rounded-2xl border border-lime-300/20 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-wider text-lime-200/80">Di chuyển</p>
            <p className="mt-1 text-sm text-lime-50/80">Chi tiêu ổn định. Bạn có thể tiết kiệm thêm <span className="font-semibold text-white">300.000đ/tháng</span> nếu đi chung xe 2 ngày/tuần.</p>
          </div>

          <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 p-3">
            <p className="text-xs uppercase tracking-wider text-lime-200/80">Mục tiêu tháng này</p>
            <p className="mt-1 text-sm text-lime-50/90">Bạn đã hoàn thành <span className="font-semibold text-white">76%</span> mục tiêu tiết kiệm cá nhân.</p>
          </div>
        </div>
      </article>
    </section>
  );
};

export default RightVisualPanel;
