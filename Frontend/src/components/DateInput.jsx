import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateForDisplay, normalizeToIsoDate } from "../util/dateInput.js";

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year, month) => new Date(year, month, 1).getDay();

const parseIsoToDate = (isoStr) => {
  const iso = normalizeToIsoDate(isoStr);
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
};

const DateInput = ({
  value,
  onChange,
  className = "",
  id,
  name,
  disabled = false,
  required = false,
  ...rest
}) => {
  const inputRef = useRef(null);
  const calendarRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [calendarStyle, setCalendarStyle] = useState({});

  const parsed = parseIsoToDate(value);
  const today = new Date();

  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  useEffect(() => {
    const p = parseIsoToDate(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  const positionCalendar = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const calHeight = 320;

    if (spaceBelow < calHeight && rect.top > calHeight) {
      setCalendarStyle({
        position: "fixed",
        top: rect.top - calHeight - 4,
        left: rect.left,
        width: Math.max(rect.width, 288),
        zIndex: 9999,
      });
    } else {
      setCalendarStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 288),
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    positionCalendar();

    const handleScroll = () => positionCalendar();
    const handleResize = () => positionCalendar();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, positionCalendar]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        calendarRef.current && !calendarRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectDay = (day) => {
    const month = viewMonth + 1;
    const isoVal = `${viewYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange?.({ target: { value: isoVal, name, id } });
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  const displayValue = value ? formatDateForDisplay(value) : "";

  const isSelectedDay = (day) =>
    parsed && parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day;

  const isTodayDay = (day) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const calendar = open ? createPortal(
    <div
      ref={calendarRef}
      style={calendarStyle}
      className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a2236] shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-2.5 pb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const selected = isSelectedDay(day);
          const isToday = isTodayDay(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => selectDay(day)}
              className={`
                relative h-8 w-full rounded-lg text-sm font-medium transition-all duration-100
                ${selected
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                  : isToday
                    ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8"
                }
              `}
            >
              {day}
              {isToday && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
            setViewYear(y);
            setViewMonth(m);
            selectDay(d);
          }}
          className="w-full py-1.5 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors"
        >
          Hôm nay
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <div className="relative">
        <input
          {...rest}
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          readOnly
          value={displayValue}
          placeholder="dd/mm/yyyy"
          disabled={disabled}
          required={required}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={`${className} cursor-pointer pr-10 select-none`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
        >
          <Calendar size={16} />
        </button>
      </div>
      {calendar}
    </div>
  );
};

export default DateInput;
