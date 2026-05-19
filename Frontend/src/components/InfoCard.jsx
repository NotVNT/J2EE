const InfoCard = ({ icon, label, value, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-200
        bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
        hover:border-amber-500/30 dark:hover:border-amber-500/30
        hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/20"
    >
      <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2
          text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="text-xl font-bold tracking-tight leading-tight break-words
          text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

export default InfoCard;
