const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default CustomLegend;
