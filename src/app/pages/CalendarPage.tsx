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
  const todayIdx   = getTodayDOW(); // Hányadik napja a hétnek ma (0-6)

  // stripStart: A hétfőtől számított eltolás. 
  // 0 = az eheti hétfő. Így a naptár hétfőtől vasárnapig mutat.
  const [stripStart, setStripStart] = useState(0);

  const [selectedDay, setSelectedDay] = useState(todayIdx);

  // Modal states
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [selectedModalDays, setSelectedModalDays] = useState<number[]>([]);
  const [rescheduleItemId, setRescheduleItemId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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

  const daySchedule = schedule.filter(s => s.dayIndex === selectedDay);

  let dayCalories = 0;
  let dayTime = 0;
  let dayDone = 0;

  daySchedule.forEach(item => {
    const isEffectiveCompleted = item.completed && !isFutureDay;
    if (isEffectiveCompleted) {
      const workout = workouts.find(w => w.id === item.workoutId);
      if (workout) {
        dayCalories += workout.calories;
        dayTime += workout.duration;
        dayDone += 1;
      }
    }
  });

  const savedWorkouts   = savedTemplates
    .map(id => workouts.find(w => w.id === id))
    .filter(Boolean) as typeof workouts;
  const recommendations = workouts
    .filter(w => !savedTemplates.includes(w.id))
    .slice(0, 3);
  const hasWorkout = (idx: number) => schedule.some(s => s.dayIndex === idx);

  // 7 napot jelenítünk meg hétfőtől vasárnapig
  const stripDays = Array.from({ length: 7 }, (_, j) => stripStart + j);

  const weekLabel = (() => {
    if (stripStart === 0) return "This Week";
    return formatWeekLabel(stripStart, weekMonday);
  })();

  const modalGrid = buildMonthGrid(modalMonth.getFullYear(), modalMonth.getMonth());

  const openScheduleModal = (workoutId: string, existingItemId?: string) => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
    setModalMonth(d);
    setSelectedModalDays([]);
    setScheduleModal(workoutId);
    setRescheduleItemId(existingItemId || null);
  };

  const closeScheduleModal = () => {
    setScheduleModal(null);
    setSelectedModalDays([]);
    setRescheduleItemId(null);
  };

  const handleScheduleConfirm = () => {
    if (scheduleModal) {
      if (rescheduleItemId) {
        removeFromSchedule(rescheduleItemId);
      }
      
      selectedModalDays.forEach(dayIdx => {
        addToSchedule(scheduleModal, dayIdx);
      });
    }
    closeScheduleModal();
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      removeFromSchedule(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="bg-background px-4 pt-12 pb-6 min-h-screen transition-colors duration-300">

      <AnimatePresence>
        {activeWorkout && (
          <ActiveWorkoutView workout={activeWorkout} onClose={() => setActiveWorkout(null)} />
        )}
      </AnimatePresence>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-5 px-2">
        <p className="text-muted-foreground text-sm">Plan & Track</p>
        <h1 className="text-foreground text-2xl font-bold mt-0.5">
          Workout <span style={{ color: ACCENT }}>Calendar</span>
        </h1>
      </div>

      {/* ── This Day stats ───────────────────────────────── */}
      <div className="mb-5 px-2">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: ACCENT }}>This day</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "kcal",    value: dayCalories,          icon: Flame,       color: "#FF6B35" },
            { label: "min",     value: dayTime,              icon: Clock,       color: "#3B82F6" },
            { label: "done",    value: dayDone,              icon: CheckSquare, color: ACCENT    },
            { label: "planned", value: daySchedule.length,   icon: Calendar,    color: "#A855F7" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl flex flex-col items-center gap-1 bg-card border border-border transition-colors">
              <s.icon size={13} style={{ color: s.color }} />
              <p className="text-foreground text-base font-bold">{s.value}</p>
              <p className="text-muted-foreground text-[9px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Week navigator + 7-day strip ─────────────────── */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setStripStart(s => s - 7)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-card border border-border hover:bg-muted"
          >
            <ChevronLeft size={15} className="text-muted-foreground" />
          </button>

          <div className="flex-1 text-center">
            <p className="text-foreground text-sm font-semibold">{weekLabel}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">
              {formatWeekLabel(stripStart, weekMonday)}
            </p>
          </div>

          <button
            onClick={() => setStripStart(s => s + 7)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-card border border-border hover:bg-muted"
          >
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        </div>

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
                  background: isSel ? ACCENT : "var(--card)",
                  border: `1px solid ${isSel ? ACCENT : isToday ? "var(--muted-foreground)" : "var(--border)"}`,
                  opacity: isPast ? 0.45 : 1,
                }}
              >
                <span className="text-[9px] font-semibold"
                  style={{ color: isSel ? "#000" : "var(--muted-foreground)" }}>
                  {dayNames[dow]}
                </span>
                <span className="text-sm font-bold"
                  style={{ color: isSel ? "#000" : isToday ? ACCENT : isPast ? "var(--muted-foreground)" : "var(--foreground)" }}>
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
          <h2 className="text-foreground text-base font-semibold">{selectedDayLabel}</h2>
          <span className="text-muted-foreground text-xs">
            {daySchedule.length} workout{daySchedule.length !== 1 ? "s" : ""}
          </span>
        </div>

        <AnimatePresence>
          {daySchedule.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-8 flex flex-col items-center gap-3 bg-card border border-border rounded-2xl">
              <Calendar size={30} className="text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No workouts scheduled</p>
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
                    background: effectiveCompleted ? "var(--muted)" : "var(--card)",
                    border: `1px solid var(--border)`,
                    opacity: effectiveCompleted ? 0.6 : 1,
                  }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${categoryColor(workout.category)}18`, color: categoryColor(workout.category) }}>
                        {workout.category.toUpperCase()}
                      </span>
                      <h3 className="font-semibold mt-1 text-sm"
                        style={{ 
                          textDecoration: effectiveCompleted ? "line-through" : "none", 
                          color: effectiveCompleted ? "var(--muted-foreground)" : "var(--foreground)" 
                        }}>
                        {workout.name}
                      </h3>
                    </div>
                    {effectiveCompleted ? (
                      <Check size={15} style={{ color: ACCENT }} />
                    ) : (
                      <button
                        onClick={() => openScheduleModal(workout.id, item.id)}
                        className="text-muted-foreground hover:text-foreground text-[10px] font-semibold px-2.5 py-1.5 rounded-md transition-colors bg-muted border border-border"
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3 mb-3">
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <Clock size={10} strokeWidth={1.5} /> {workout.duration}<span className="text-[10px]">min</span>
                    </span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <Flame size={10} strokeWidth={1.5} /> {workout.calories}<span className="text-[10px]">kcal</span>
                    </span>
                    <span className="text-muted-foreground text-xs capitalize">{workout.level}</span>
                  </div>
                  
                  {!effectiveCompleted ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => !isFutureDay && setActiveWorkout(workout)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        style={{
                          background: isFutureDay ? "var(--muted)" : ACCENT,
                          color: isFutureDay ? "var(--muted-foreground)" : "#000",
                          cursor: isFutureDay ? "not-allowed" : "pointer",
                        }}>
                        <Play size={12} fill={isFutureDay ? "var(--muted-foreground)" : "#000"} strokeWidth={0} />
                        {isFutureDay ? "Upcoming" : "Start"}
                      </button>
                      
                      {!isFutureDay && (
                        <button onClick={() => markComplete(item.id)}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-muted-foreground bg-transparent border border-border hover:bg-muted transition-colors">
                          <Check size={12} /> Done
                        </button>
                      )}

                      <button onClick={() => setDeleteConfirmId(item.id)}
                        className="w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors bg-transparent border border-border hover:bg-muted text-muted-foreground">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs text-center py-1">Completed ✓</p>
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
            <h2 className="text-foreground text-base font-semibold">Saved Templates</h2>
            <Bookmark size={13} style={{ color: ACCENT }} />
          </div>
          <div className="flex flex-col gap-3">
            {savedWorkouts.map(workout => (
              <div key={workout.id} className="p-4 rounded-2xl flex items-center justify-between bg-card border border-border">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-foreground text-sm font-semibold truncate">{workout.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-2">
                    <Clock size={10} strokeWidth={1.5} /> {workout.duration} min
                    <Flame size={10} strokeWidth={1.5} /> {workout.calories} kcal
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setActiveWorkout(workout)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: ACCENT }}>
                    <Play size={12} fill="#000" strokeWidth={0} />
                  </button>
                  <button onClick={() => addToSchedule(workout.id, selectedDay)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent border border-border hover:bg-muted transition-colors">
                    <Plus size={14} style={{ color: ACCENT }} />
                  </button>
                  <button onClick={() => openScheduleModal(workout.id)}
                    className="px-2.5 h-8 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 text-muted-foreground bg-transparent border border-border hover:bg-muted transition-colors">
                    <Calendar size={11} /> Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ──────────────────────────────── */}
      <div className="mb-4 px-2">
        <h2 className="text-foreground text-base font-semibold mb-3">Recommended</h2>
        <div className="flex flex-col gap-3">
          {recommendations.map(workout => (
            <div key={workout.id} className="p-4 rounded-2xl flex items-center justify-between bg-card border border-border">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-foreground text-sm font-semibold truncate">{workout.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5 capitalize">{workout.category} · {workout.level}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setActiveWorkout(workout)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: ACCENT }}>
                  <Play size={12} fill="#000" strokeWidth={0} />
                </button>
                <button onClick={() => addToSchedule(workout.id, selectedDay)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent border border-border hover:bg-muted transition-colors">
                  <Plus size={14} style={{ color: ACCENT }} />
                </button>
                <button onClick={() => openScheduleModal(workout.id)}
                  className="px-2.5 h-8 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 text-muted-foreground bg-transparent border border-border hover:bg-muted transition-colors">
                  <Calendar size={11} /> Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ────────────────────── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setDeleteConfirmId(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 26 }}
              className="w-full max-w-[320px] rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl bg-card border border-border"
              onClick={e => e.stopPropagation()}>
              
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#FF3B6B15" }}>
                <Trash2 size={24} style={{ color: "#FF3B6B" }} />
              </div>
              
              <h3 className="text-foreground text-lg font-bold mb-2">Delete Workout?</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Are you sure you want to remove this workout from your schedule? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all text-foreground border border-border hover:bg-muted">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: "#FF3B6B" }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Schedule Modal — month calendar picker ────────── */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center pb-[100px] px-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={closeScheduleModal}>
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 26 }}
              className="w-full max-w-[430px] rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-card border border-border"
              style={{ maxHeight: "75vh" }}
              onClick={e => e.stopPropagation()}>

              {/* Fixed header */}
              <div className="px-5 pt-5 pb-3 shrink-0 border-b border-border">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-foreground text-lg font-bold">
                      {rescheduleItemId ? "Reschedule Workout" : "Schedule Workout"}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {rescheduleItemId 
                        ? "Move this workout to another day" 
                        : "Select one or more future days"}
                    </p>
                  </div>
                  <button onClick={closeScheduleModal}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground bg-muted hover:bg-muted/80">✕</button>
                </div>
                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setModalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-foreground text-sm font-semibold">
                    {MONTH_NAMES[modalMonth.getMonth()]} {modalMonth.getFullYear()}
                  </span>
                  <button onClick={() => setModalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                    <ChevronRight size={14} />
                  </button>
                </div>
                {/* DOW headers */}
                <div className="grid grid-cols-7">
                  {dayNames.map(d => (
                    <div key={d} className="text-center text-[9px] font-semibold text-muted-foreground pb-1">{d}</div>
                  ))}
                </div>
              </div>

              {/* Scrollable grid */}
              <div className="overflow-y-auto px-4 pb-4 pt-3 flex-1">
                <div className="grid grid-cols-7 gap-1">
                  {modalGrid.map((date, i) => {
                    if (!date) return <div key={`me-${i}`} />;
                    const idx        = dateToIdx(date, weekMonday);
                    const isPast     = idx < todayIdx;
                    const isToday    = idx === todayIdx;
                    const isSelected = selectedModalDays.includes(idx);
                    
                    return (
                      <button key={date.toISOString()} disabled={isPast}
                        onClick={() => {
                          if (isPast) return;
                          setSelectedModalDays(prev => 
                            prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
                          );
                        }}
                        className="py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition-all"
                        style={{
                          background: isSelected ? ACCENT : isPast ? "var(--muted)" : isToday ? `${ACCENT}18` : "var(--card)",
                          border: `1px solid ${isSelected ? ACCENT : isPast ? "var(--border)" : isToday ? ACCENT : "var(--border)"}`,
                          cursor: isPast ? "not-allowed" : "pointer",
                          opacity: isPast ? 0.4 : 1,
                        }}>
                        <span className="text-xs font-semibold"
                          style={{ color: isSelected ? "#000" : isPast ? "var(--muted-foreground)" : isToday ? ACCENT : "var(--foreground)" }}>
                          {date.getDate()}
                        </span>
                        {isToday && !isSelected && (
                          <span className="text-[7px] leading-none" style={{ color: ACCENT }}>Today</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sticky footer action */}
              <div className="px-4 pb-4 pt-2 shrink-0">
                <button 
                  onClick={handleScheduleConfirm}
                  disabled={selectedModalDays.length === 0}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center transition-all disabled:opacity-50"
                  style={{
                    background: selectedModalDays.length > 0 ? ACCENT : "var(--muted)",
                    color: selectedModalDays.length > 0 ? "#000" : "var(--muted-foreground)",
                    cursor: selectedModalDays.length > 0 ? "pointer" : "not-allowed"
                  }}
                >
                  {selectedModalDays.length > 0 
                    ? `Confirm for ${selectedModalDays.length} day${selectedModalDays.length > 1 ? 's' : ''}` 
                    : "Select days"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}