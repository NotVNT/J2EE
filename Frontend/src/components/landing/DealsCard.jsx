const chartPoints = "0,70 35,52 70,58 105,22 140,68 175,78 210,34 245,44";

const DealsCard = () => {
  return (
    <article className="rounded-3xl border border-lime-200/20 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center justify-between text-sm text-lime-50/80">
        <span className="font-medium text-white">Giao dịch</span>
        <span>Hiển thị: Theo tháng</span>
      </div>

      <svg
        viewBox="0 0 245 95"
        className="mt-4 h-32 w-full"
        role="img"
        aria-label="Biểu đồ giao dịch theo tháng"
      >
        <polyline
          points={chartPoints}
          fill="none"
          stroke="#bef264"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="210" cy="34" r="6" fill="#bef264" />
      </svg>

      <div className="mt-2 flex justify-between text-xs text-lime-50/70">
        <span>1 Th12</span>
        <span>8 Th12</span>
        <span>16 Th12</span>
        <span>31 Th12</span>
      </div>
    </article>
  );
};

export default DealsCard;
