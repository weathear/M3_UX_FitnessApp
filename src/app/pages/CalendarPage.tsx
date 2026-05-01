import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, Clock, CheckSquare, Calendar, Check,
  Trash2, Plus, Bookmark, Play, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { workouts, dayNames, Workout } from "../data/mockData";
import { useNavigate } from "react-router";
import { ActiveWorkoutView } from "../components/workout/ActiveWorkoutView";

const ACCENT = "#CCFF00";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// Mon=0 … Sun=6
function getTodayDOW(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

// Monday of the current week, 00:00
function getWeekMonday(): Date {
  const dow = getTodayDOW();
  const d = new Date();
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}

// dayIndex = days from weekMonday
function dateToIdx(date: Date, weekMonday: Date): number {
  return Math.round((date.getTime() - weekMonday.getTime()) / 86400000);
}

function idxToDate(idx: number, weekMonday: Date): Date {
  return new Date(weekMonday.getTime() + idx * 86400000);
}

// Build Mon-anchored month grid
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const startDOW = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const grid: (Date | null)[] = Array(startDOW).fill(null);
  for (let d = 1; d <= last.getDate(); d++) grid.push(new Date(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function categoryColor(cat: string) {
  if (cat === "strength") return "#FF6B35";
  if (cat === "cardio")   return "#FF3B6B";
  return ACCENT;
}

function formatWeekLabel(startIdx: number, weekMonday: Date): string {
  const start = idxToDate(startIdx,     weekMonday);
  const end   = idxToDate(startIdx + 6, weekMonday);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (start.getMonth() === end.getMonth())
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()}–${end.getDate()}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

// ──────────────────────────────────────────────────────────────
export function CalendarPage() {
  const {
    schedule, removeFromSchedule, markComplete,
    savedTemplates, addToSchedule, completedSessions,
  } = useApp();
  const navigate = useNavigate();

  const weekMonday = getWeekMonday();
  const todayIdx   = getTodayDOW(); // dayIndex of today

  // stripStart: dayIndex of the LEFTMOST day in the 7-day strip
  // Initial: today at position 3 → stripStart = todayIdx - 3
  const [stripStart, setStripStart] = useState(() => todayIdx - 3);

  const [selectedDay, setSelectedDay] = useState(todayIdx);

  // Modal states
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [modalMonth, setModalMonth] = useState<Date>(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // ── derived ────────────────────────────────────────────────
  const selectedDate    = idxToDate(selectedDay, weekMonday);
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const selectedDayLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });
  const isFutureDay = selectedDay > todayIdx;
  const isPastDay   = selectedDay < todayIdx;

  const daySessions = completedSessions.filter(s => s.date === selectedDateStr);
  const dayCalories = daySessions.reduce((a, s) => a + s.calories, 0);
  const dayTime     = daySessions.reduce((a, s) => a + s.duration, 0);
  const dayDone     = daySessions.length;
  const daySchedule = schedule.filter(s => s.dayIndex === selectedDay);

  const savedWorkouts   = savedTemplates
    .map(id => workouts.find(w => w.id === id))
    .filter(Boolean) as typeof workouts;
  const recommendations = workouts
    .filter(w => !savedTemplates.includes(w.id))
    .slice(0, 3);
  const hasWorkout = (idx: number) => schedule.some(s => s.dayIndex === idx);

  // 7 days shown in the strip
  const stripDays = Array.from({ length: 7 }, (_, j) => stripStart + j);

  // Week label in the navigator header
  const weekLabel = (() => {
    if (
      stripStart <= todayIdx && todayIdx <= stripStart + 6 &&
      stripStart === todayIdx - 3
    ) return "This Week";
    return formatWeekLabel(stripStart, weekMonday);
  })();

  const modalGrid = buildMonthGrid(modalMonth.getFullYear(), modalMonth.getMonth());

  const openScheduleModal = (workoutId: string) => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
    setModalMonth(d);
    setScheduleModal(workoutId);
  };

  // ──────────────────────────────────────────────────────────
  return (
    <div className="bg-[#09090B] px-4 pt-12 pb-6">

      {/* Active workout overlay */}
      <AnimatePresence>
        {activeWorkout && (
          <ActiveWorkoutView workout={activeWorkout} onClose={() => setActiveWorkout(null)} />
        )}
      </AnimatePresence>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-5 px-2">
        <p className="text-[#A1A1AA] text-sm">Plan & Track</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">
          Workout <span style={{ color: ACCENT }}>Calendar</span>
        </h1>
      </div>

      {/* ── This Day stats ───────────────────────────────── */}
      <div className="mb-5 px-2">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: ACCENT }}>This day</span>
          <div className="flex-1 h-px" style={{ background: "#27272A" }} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "kcal",    value: dayCalories > 0 ? dayCalories.toLocaleString() : "—", icon: Flame,       color: "#FF6B35" },
            { label: "min",     value: dayTime > 0 ? dayTime : "—",                           icon: Clock,       color: "#3B82F6" },
            { label: "done",    value: dayDone,                                                icon: CheckSquare, color: ACCENT    },
            { label: "planned", value: daySchedule.length,                                    icon: Calendar,    color: "#A855F7" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl flex flex-col items-center gap-1"
              style={{ background: "#111113", border: "1px solid #27272A" }}>
              <s.icon size={13} style={{ color: s.color }} />
              <p className="text-white text-base font-bold">{s.value}</p>
              <p className="text-[#A1A1AA] text-[9px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Week navigator + 7-day strip ─────────────────── */}
      <div className="mb-6 px-2">

        {/* Navigator row */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setStripStart(s => s - 7)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "#111113", border: "1px solid #27272A" }}
          >
            <ChevronLeft size={15} style={{ color: "#A1A1AA" }} />
          </button>

          <div className="flex-1 text-center">
            <p className="text-white text-sm font-semibold">{weekLabel}</p>
            <p className="text-[#A1A1AA] text-[10px] mt-0.5">
              {formatWeekLabel(stripStart, weekMonday)}
            </p>
          </div>

          <button
            onClick={() => setStripStart(s => s + 7)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "#111113", border: "1px solid #27272A" }}
          >
            <ChevronRight size={15} style={{ color: "#A1A1AA" }} />
          </button>
        </div>

        {/* 7-day strip */}
        <div className="grid grid-cols-7 gap-1">
          {stripDays.map(idx => {
            const date     = idxToDate(idx, weekMonday);
            const dow      = date.getDay() === 0 ? 6 : date.getDay() - 1;
            const isToday  = idx === todayIdx;
            const isPast   = idx < todayIdx;
            const isSel    = idx === selectedDay;
            const hasWork  = hasWorkout(idx);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all"
                style={{
                  background: isSel ? ACCENT : "#111113",
                  border: `1px solid ${isSel ? ACCENT : isToday ? "#52525B" : "#27272A"}`,
                  opacity: isPast ? 0.45 : 1,
                }}
              >
                <span className="text-[9px] font-semibold"
                  style={{ color: isSel ? "#000" : "#A1A1AA" }}>
                  {dayNames[dow]}
                </span>
                <span className="text-sm font-bold"
                  style={{ color: isSel ? "#000" : isToday ? ACCENT : isPast ? "#3F3F46" : "#fff" }}>
                  {date.getDate()}
                </span>
                {isToday && !isSel && (
                  <span className="text-[7px] leading-none" style={{ color: ACCENT }}>Today</span>
                )}
                {hasWork && (
                  <div className="w-1 h-1 rounded-full"
                    style={{ background: isSel ? "#000" : ACCENT }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected day workouts ─────────────────────────── */}
      <div className="mb-6 px-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-base font-semibold">{selectedDayLabel}</h2>
          <span className="text-[#A1A1AA] text-xs">
            {daySchedule.length} workout{daySchedule.length !== 1 ? "s" : ""}
          </span>
        </div>

        <AnimatePresence>
          {daySchedule.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-8 flex flex-col items-center gap-3"
              style={{ background: "#111113", borderRadius: 16, border: "1px solid #27272A" }}>
              <Calendar size={30} style={{ color: "#71717A" }} />
              <p className="text-[#A1A1AA] text-sm">No workouts scheduled</p>
              {!isPastDay && (
                <button onClick={() => navigate("/app/browse")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-black flex items-center gap-1.5"
                  style={{ background: ACCENT }}>
                  <Plus size={13} /> Add Workout
                </button>
              )}
            </motion.div>
          ) : (
            daySchedule.map(item => {
              const workout = workouts.find(w => w.id === item.workoutId);
              if (!workout) return null;
              const effectiveCompleted = item.completed && !isFutureDay;
              return (
                <motion.div key={item.id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="mb-3 p-4 rounded-2xl"
                  style={{
                    background: effectiveCompleted ? "#0D0D0F" : "#111113",
                    border: `1px solid ${effectiveCompleted ? "#1C1C1E" : "#27272A"}`,
                    opacity: effectiveCompleted ? 0.6 : 1,
                  }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${categoryColor(workout.category)}18`, color: categoryColor(workout.category) }}>
                        {workout.category.toUpperCase()}
                      </span>
                      <h3 className="font-semibold mt-1 text-sm"
                        style={{ textDecoration: effectiveCompleted ? "line-through" : "none", color: effectiveCompleted ? "#71717A" : "#fff" }}>
                        {workout.name}
                      </h3>
                    </div>
                    {effectiveCompleted && <Check size={15} style={{ color: ACCENT }} />}
                  </div>
                  <div className="flex gap-3 mb-3">
                    <span className="text-[#A1A1AA] text-xs flex items-center gap-1">
                      <Clock size={10} strokeWidth={1.5} /> {workout.duration}<span className="text-[10px]">min</span>
                    </span>
                    <span className="text-[#A1A1AA] text-xs flex items-center gap-1">
                      <Flame size={10} strokeWidth={1.5} /> {workout.calories}<span className="text-[10px]">kcal</span>
                    </span>
                    <span className="text-[#71717A] text-xs capitalize">{workout.level}</span>
                  </div>
                  {!effectiveCompleted ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => !isFutureDay && setActiveWorkout(workout)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        style={{
                          background: isFutureDay ? "#1C1C1E" : ACCENT,
                          color: isFutureDay ? "#3F3F46" : "#000",
                          cursor: isFutureDay ? "not-allowed" : "pointer",
                        }}>
                        <Play size={12} fill={isFutureDay ? "#3F3F46" : "#000"} strokeWidth={0} />
                        {isFutureDay ? "Upcoming" : "Start"}
                      </button>
                      {!isFutureDay && (
                        <button onClick={() => markComplete(item.id)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                          style={{ background: "transparent", color: "#A1A1AA", border: "1px solid #27272A" }}>
                          <Check size={12} /> Done
                        </button>
                      )}
                      <button onClick={() => removeFromSchedule(item.id)}
                        className="w-10 rounded-xl flex items-center justify-center"
                        style={{ background: "transparent", border: "1px solid #27272A" }}>
                        <Trash2 size={13} style={{ color: "#71717A" }} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[#71717A] text-xs text-center py-1">Completed ✓</p>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Saved Templates ──────────────────────────────── */}
      {savedWorkouts.length > 0 && (
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-base font-semibold">Saved Templates</h2>
            <Bookmark size={13} style={{ color: ACCENT }} />
          </div>
          <div className="flex flex-col gap-3">
            {savedWorkouts.map(workout => (
              <div key={workout.id} className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: "#111113", border: "1px solid #27272A" }}>
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-white text-sm font-semibold truncate">{workout.name}</p>
                  <p className="text-[#71717A] text-xs mt-0.5 flex items-center gap-2">
                    <Clock size={10} strokeWidth={1.5} /> {workout.duration} min
                    <Flame size={10} strokeWidth={1.5} /> {workout.calories} kcal
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveWorkout(workout)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: ACCENT }}>
                    <Play size={13} fill="#000" strokeWidth={0} />
                  </button>
                  <button onClick={() => openScheduleModal(workout.id)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
                    style={{ background: "transparent", color: "#A1A1AA", border: "1px solid #27272A" }}>
                    <Plus size={11} /> Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ──────────────────────────────── */}
      <div className="mb-4 px-2">
        <h2 className="text-white text-base font-semibold mb-3">Recommended</h2>
        <div className="flex flex-col gap-3">
          {recommendations.map(workout => (
            <div key={workout.id} className="p-4 rounded-2xl flex items-center justify-between"
              style={{ background: "#111113", border: "1px solid #27272A" }}>
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-white text-sm font-semibold truncate">{workout.name}</p>
                <p className="text-[#71717A] text-xs mt-0.5 capitalize">{workout.category} · {workout.level}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveWorkout(workout)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: ACCENT }}>
                  <Play size={13} fill="#000" strokeWidth={0} />
                </button>
                <button onClick={() => openScheduleModal(workout.id)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "transparent", border: "1px solid #27272A" }}>
                  <Plus size={13} style={{ color: ACCENT }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Schedule Modal — month calendar picker ────────── */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setScheduleModal(null)}>
            <motion.div
              initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
              transition={{ type: "spring", damping: 26 }}
              className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
              style={{ background: "#111113", border: "1px solid #27272A", maxHeight: "82vh" }}
              onClick={e => e.stopPropagation()}>

              {/* Fixed header */}
              <div className="px-5 pt-5 pb-3" style={{ borderBottom: "1px solid #27272A" }}>
                <div className="w-10 h-1 bg-[#3F3F46] rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white text-lg font-bold">Schedule Workout</h3>
                    <p className="text-[#A1A1AA] text-xs mt-0.5">Pick any future day</p>
                  </div>
                  <button onClick={() => setScheduleModal(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#A1A1AA]"
                    style={{ background: "#1C1C1E" }}>✕</button>
                </div>
                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setModalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#1C1C1E" }}>
                    <ChevronLeft size={14} style={{ color: "#A1A1AA" }} />
                  </button>
                  <span className="text-white text-sm font-semibold">
                    {MONTH_NAMES[modalMonth.getMonth()]} {modalMonth.getFullYear()}
                  </span>
                  <button onClick={() => setModalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#1C1C1E" }}>
                    <ChevronRight size={14} style={{ color: "#A1A1AA" }} />
                  </button>
                </div>
                {/* DOW headers */}
                <div className="grid grid-cols-7">
                  {dayNames.map(d => (
                    <div key={d} className="text-center text-[9px] font-semibold text-[#3F3F46] pb-1">{d}</div>
                  ))}
                </div>
              </div>

              {/* Scrollable grid */}
              <div className="overflow-y-auto px-4 pb-6 pt-3"
                style={{ maxHeight: "calc(82vh - 215px)" }}>
                <div className="grid grid-cols-7 gap-1">
                  {modalGrid.map((date, i) => {
                    if (!date) return <div key={`me-${i}`} />;
                    const idx     = dateToIdx(date, weekMonday);
                    const isPast  = idx < todayIdx;
                    const isToday = idx === todayIdx;
                    return (
                      <button key={date.toISOString()} disabled={isPast}
                        onClick={() => {
                          if (isPast) return;
                          addToSchedule(scheduleModal, idx);
                          setScheduleModal(null);
                        }}
                        className="py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition-all"
                        style={{
                          background: isPast ? "#0D0D0F" : isToday ? `${ACCENT}18` : "#1C1C1E",
                          border: `1px solid ${isPast ? "#1C1C1E" : isToday ? ACCENT : "#27272A"}`,
                          cursor: isPast ? "not-allowed" : "pointer",
                          opacity: isPast ? 0.28 : 1,
                        }}>
                        <span className="text-xs font-semibold"
                          style={{ color: isPast ? "#3F3F46" : isToday ? ACCENT : "#fff" }}>
                          {date.getDate()}
                        </span>
                        {isToday && (
                          <span className="text-[7px] leading-none" style={{ color: ACCENT }}>Today</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
