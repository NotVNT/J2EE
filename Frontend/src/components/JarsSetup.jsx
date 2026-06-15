import { useState, useContext } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Check, AlertTriangle, Sparkles, BookOpen } from "lucide-react";
import axiosConfig from "../util/axiosConfig.jsx";
import { AppContext } from "../context/AppContext.jsx";

const DEFAULT_SUGGESTED_JARS = [
  { name: "Necessities", icon: "🏠", color: "#EF4444", targetPercentage: 55 },
  { name: "Savings", icon: "💼", color: "#10B981", targetPercentage: 10 },
  { name: "Education", icon: "🎓", color: "#3B82F6", targetPercentage: 10 },
  { name: "Play", icon: "🎉", color: "#EC4899", targetPercentage: 10 },
  { name: "Investment", icon: "📈", color: "#F59E0B", targetPercentage: 10 },
  { name: "Giving", icon: "❤️", color: "#F97316", targetPercentage: 5 },
];

const PRESET_COLORS = ["#EF4444", "#10B981", "#3B82F6", "#EC4899", "#F59E0B", "#F97316", "#8B5CF6", "#06B6D4", "#6366F1", "#84CC16"];
const PRESET_EMOJIS = ["🏠", "💼", "🎓", "🎉", "📈", "❤️", "🍔", "🛍️", "✈️", "🏥", "💰", "🔮", "🚲", "🎮", "🛡️"];

const JarsSetup = ({ onComplete }) => {
  const { user } = useContext(AppContext);
  const [draftJars, setDraftJars] = useState(DEFAULT_SUGGESTED_JARS);
  const [submitting, setSubmitting] = useState(false);

  const [balancingInfo, setBalancingInfo] = useState(null);
  const [pendingDeleteAllocation, setPendingDeleteAllocation] = useState(null);

  // Add a new draft jar
  const handleAddDraft = () => {
    const nextColor = PRESET_COLORS[draftJars.length % PRESET_COLORS.length];
    const nextEmoji = PRESET_EMOJIS[draftJars.length % PRESET_EMOJIS.length];
    setDraftJars([
      ...draftJars,
      { name: "New jar", icon: nextEmoji, color: nextColor, targetPercentage: 0 },
    ]);
  };

  // Delete a draft jar
  const handleDeleteDraft = (index) => {
    const deletedJar = draftJars[index];
    const nextList = draftJars.filter((_, i) => i !== index);
    setDraftJars(nextList);
    setBalancingInfo(null);

    // If deleted jar had percentage > 0 and there are still other draft jars, allow user to reallocate
    if (deletedJar && deletedJar.targetPercentage > 0 && nextList.length > 0) {
      setPendingDeleteAllocation({
        name: deletedJar.name || "Unnamed jar",
        percentage: Number(deletedJar.targetPercentage) || 0
      });
    } else {
      setPendingDeleteAllocation(null);
    }
  };

  const handleApplyDeleteAllocation = (targetIndex) => {
    if (!pendingDeleteAllocation || targetIndex === "") return;
    
    const nextList = [...draftJars];
    const targetJar = nextList[targetIndex];
    if (targetJar) {
      const currentTargetPct = Number(targetJar.targetPercentage) || 0;
      const newTargetPct = currentTargetPct + pendingDeleteAllocation.percentage;
      nextList[targetIndex] = { ...targetJar, targetPercentage: newTargetPct };
      setDraftJars(nextList);
    }
    setPendingDeleteAllocation(null);
  };

  // Update a field value in a draft jar
  const handleUpdateDraft = (index, key, value) => {
    const nextList = [...draftJars];
    
    if (key === "targetPercentage") {
      const newPct = Number(value) || 0;
      
      // Get originalPct: if balancingInfo is for this jar, keep old originalPct
      let originalPct;
      if (balancingInfo && balancingInfo.index === index) {
        originalPct = balancingInfo.originalPct;
      } else {
        originalPct = Number(draftJars[index].targetPercentage) || 0;
      }
      
      const diff = newPct - originalPct;
      
      nextList[index] = { ...nextList[index], targetPercentage: newPct };
      setDraftJars(nextList);
      
      if (diff !== 0 && draftJars.length > 1) {
        setBalancingInfo({ index, diff, originalPct });
      } else {
        setBalancingInfo(null);
      }
    } else {
      nextList[index] = { ...nextList[index], [key]: value };
      setDraftJars(nextList);
    }
  };

  const handleApplyBalancing = (targetIndex) => {
    if (!balancingInfo || targetIndex === "") return;
    
    const nextList = [...draftJars];
    const targetJar = nextList[targetIndex];
    if (targetJar) {
      const currentTargetPct = Number(targetJar.targetPercentage) || 0;
      const newTargetPct = Math.max(0, currentTargetPct - balancingInfo.diff);
      nextList[targetIndex] = { ...targetJar, targetPercentage: newTargetPct };
      setDraftJars(nextList);
    }
    setBalancingInfo(null);
  };

  const totalPercentage = draftJars.reduce((sum, j) => sum + (Number(j.targetPercentage) || 0), 0);
  const isBalanced = totalPercentage === 100;

  const plan = user?.subscriptionPlan || "FREE";
  const maxJars = plan === "PREMIUM" ? Infinity : plan === "BASIC" ? 6 : 1;
  const isLimitExceeded = draftJars.length > maxJars;

  const handleSaveAll = async () => {
    if (!isBalanced) {
      toast.error("Total allocation percentage must equal 100%");
      return;
    }
    if (isLimitExceeded) {
      toast.error(`Your current plan (${plan}) supports a maximum of ${maxJars} jar(s). Please remove some jars or upgrade your plan!`);
      return;
    }

    const invalidJar = draftJars.find(j => !j.name.trim());
    if (invalidJar) {
      toast.error("Please enter a name for all jars");
      return;
    }

    setSubmitting(false);
    try {
      const payload = draftJars.map(j => ({
        name: j.name.trim(),
        icon: j.icon,
        color: j.color,
        targetPercentage: Number(j.targetPercentage) || 0,
        currentBalance: 0
      }));

      await axiosConfig.post("/jars/bulk", payload);
      toast.success("Jar configuration initialized successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Unable to initialize jar configuration.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left column: 6 Jars method introduction */}
      <div className="lg:col-span-4 space-y-6">
        <div className="card bg-violet-600 text-white relative overflow-hidden border-none shadow-xl">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl -translate-x-10 translate-y-20" />

          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl shadow-inner">
              <Sparkles className="text-amber-300" size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">6 Jars Money Management Rule</h3>
            <p className="text-sm text-violet-100 leading-relaxed">
              T. Harv Eker&apos;s classic financial management rule helps you divide your income into smart spending categories, ensuring you meet essential needs while building lasting financial freedom.
            </p>
          </div>
        </div>

        <div className="card space-y-4 border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen size={16} className="text-violet-500" />
            Structure details
          </h4>
          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <p><strong className="text-red-500">🏠 Necessities (55%):</strong> Pay for daily living expenses (rent, food, transport, bills...).</p>
            <p><strong className="text-emerald-500">💼 Savings (10%):</strong> Long-term fund accumulated for big plans or emergencies.</p>
            <p><strong className="text-blue-500">🎓 Education (10%):</strong> Invest in self-development (books, skill courses, seminars...).</p>
            <p><strong className="text-pink-500">🎉 Play (10%):</strong> Reward yourself to stay motivated (travel, entertainment, dining out...).</p>
            <p><strong className="text-amber-500">📈 Investment (10%):</strong> Financial freedom fund to grow your wealth (stocks, business ventures...).</p>
            <p><strong className="text-orange-500">❤️ Giving (5%):</strong> Give back and share with the community, help those in need.</p>
          </div>
        </div>
      </div>

      {/* Right column: Interactive draft configuration */}
      <div className="lg:col-span-8 space-y-6">
        <div className="card shadow-lg border-slate-200/80 dark:border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Set up your jar configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize names and allocation percentages to fit your personal plan</p>
            </div>
            <button
              onClick={handleAddDraft}
              disabled={isLimitExceeded}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold
                border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add draft jar
            </button>
          </div>

          {/* List draft jars */}
          <div className="space-y-3">
            {draftJars.map((jar, index) => {
              const isBalancingThis = balancingInfo && balancingInfo.index === index;
              return (
                <div key={index} className="space-y-2">
                  <div 
                    className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group transition-all"
                  >
                    {/* Icon selection dropdown */}
                    <select
                      value={jar.icon}
                      onChange={(e) => handleUpdateDraft(index, "icon", e.target.value)}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-center text-lg outline-none cursor-pointer"
                    >
                      {PRESET_EMOJIS.map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>

                    {/* Color circle selection */}
                    <select
                      value={jar.color}
                      onChange={(e) => handleUpdateDraft(index, "color", e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 text-center text-xs outline-none cursor-pointer"
                      style={{ backgroundColor: jar.color, color: "#fff" }}
                    >
                      {PRESET_COLORS.map(color => (
                        <option key={color} value={color} style={{ backgroundColor: color }}>Color</option>
                      ))}
                    </select>

                    {/* Name Input */}
                    <input
                      type="text"
                      value={jar.name}
                      onChange={(e) => handleUpdateDraft(index, "name", e.target.value)}
                      placeholder="Jar name..."
                      className="flex-1 w-full text-sm font-semibold px-3 py-2 rounded-xl
                        bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10
                        text-slate-800 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                    />

                    {/* Percentage Input with +/- controls */}
                    <div className="flex items-center gap-1.5 w-full sm:w-36 shrink-0 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = Number(jar.targetPercentage) || 0;
                          handleUpdateDraft(index, "targetPercentage", Math.max(0, currentVal - 1));
                        }}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
                        title="Decrease 1%"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={jar.targetPercentage === 0 ? "" : jar.targetPercentage}
                        onChange={(e) => handleUpdateDraft(index, "targetPercentage", parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 55"
                        min="0"
                        max="100"
                        className="w-12 text-center text-sm font-bold py-1.5 rounded-lg
                          bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10
                          text-slate-800 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = Number(jar.targetPercentage) || 0;
                          handleUpdateDraft(index, "targetPercentage", Math.min(100, currentVal + 1));
                        }}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
                        title="Increase 1%"
                      >
                        +
                      </button>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">%</span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteDraft(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title="Delete jar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Smart draft jar balance */}
                  {isBalancingThis && (
                    <div className={`mx-3 p-3 rounded-xl border text-xs leading-relaxed space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
                      balancingInfo.diff > 0 
                        ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                        : "bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          ⚖️ Balance draft jar allocation:
                        </span>
                        <button 
                          onClick={() => setBalancingInfo(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
                        >
                          Skip
                        </button>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        {balancingInfo.diff > 0 ? (
                          <>You are increasing this jar by <strong className="font-extrabold text-amber-600">{balancingInfo.diff.toFixed(1)}%</strong>. Select a draft jar to decrease by {balancingInfo.diff.toFixed(1)}% to balance:</>
                        ) : (
                          <>You are decreasing this jar by <strong className="font-extrabold text-blue-600">{Math.abs(balancingInfo.diff).toFixed(1)}%</strong>. Select a draft jar to increase by {Math.abs(balancingInfo.diff).toFixed(1)}% to balance:</>
                        )}
                      </p>
                      <select
                        onChange={(e) => handleApplyBalancing(Number(e.target.value))}
                        className="w-full mt-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 outline-none text-slate-700 dark:text-slate-300 text-xs font-semibold focus:ring-1 focus:ring-slate-400/20 cursor-pointer"
                        defaultValue=""
                      >
                        <option value="">-- Select balancing draft jar --</option>
                        {draftJars
                          .map((j, i) => ({ ...j, originalIndex: i }))
                          .filter(j => j.originalIndex !== index)
                          .map(j => (
                            <option key={j.originalIndex} value={j.originalIndex}>
                              {j.icon || "🏺"} {j.name} (Current: {j.targetPercentage}%)
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pending Delete Recovery Allocation alert */}
          {pendingDeleteAllocation && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="leading-relaxed">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  ♻️ Recover deleted jar percentage:
                </span>
                You just deleted jar <strong className="text-slate-800 dark:text-white">&quot;{pendingDeleteAllocation.name}&quot;</strong> ({pendingDeleteAllocation.percentage}%). Select a jar to receive this percentage to preserve the 100% total:
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  onChange={(e) => handleApplyDeleteAllocation(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 outline-none text-slate-700 dark:text-slate-300 text-xs font-semibold focus:ring-1 focus:ring-slate-400/20 cursor-pointer"
                  defaultValue=""
                >
                  <option value="">-- Select jar to receive % --</option>
                  {draftJars.map((j, i) => (
                    <option key={i} value={i}>
                      {j.icon || "🏺"} {j.name} (Current: {j.targetPercentage}%)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setPendingDeleteAllocation(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium px-2 py-1 text-xs"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Progress bar and Balance warning */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total draft percentage:</span>
                  <span className={`text-base font-extrabold ${isBalanced ? "text-emerald-500" : "text-red-500"}`}>
                    {totalPercentage}% / 100%
                  </span>
                  {isBalanced ? (
                    <Check size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  )}
                </div>
                {isLimitExceeded && (
                  <p className="text-xs text-red-500 font-medium">
                    ⚠️ Plan {plan} allows a maximum of {maxJars} jar(s). You have created {draftJars.length} jars.
                  </p>
                )}
                {!isBalanced && (
                  <p className="text-xs text-slate-400">
                    * Total percentage of all draft jars must equal exactly 100% for valid income allocation.
                  </p>
                )}
              </div>

              <button
                onClick={handleSaveAll}
                disabled={submitting || !isBalanced || isLimitExceeded}
                className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-extrabold text-white shadow-md transition-all transform-gpu active:scale-95
                  ${(isBalanced && !isLimitExceeded && !submitting) 
                    ? "bg-violet-600 hover:bg-violet-700 hover:shadow-lg cursor-pointer" 
                    : "bg-slate-300 dark:bg-slate-800 opacity-60 cursor-not-allowed"}`}
              >
                {submitting ? "Saving..." : "⚡ Complete jar setup"}
              </button>
            </div>

            {/* Total Balance Progress indicator */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
              <div
                className="h-full rounded-full transition-[width,background-color] duration-500 ease-out"
                style={{
                  width: `${Math.min(totalPercentage, 100)}%`,
                  backgroundColor: isBalanced ? "#10B981" : "#EF4444",
                }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default JarsSetup;
