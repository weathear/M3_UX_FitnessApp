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

function getTodayStr(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

function getTodayDOW(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function getWeekMonday(): Date {
  const dow = getTodayDOW();
  const d = new Date();
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateToIdx(date: Date, weekMonday: Date): number {
  return Math.round((date.getTime() - weekMonday.getTime()) / 86400000);
}

function idxToDate(idx: number, weekMonday: Date): Date {
  return new Date(weekMonday.getTime() + idx * 86400000);
}

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
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (start.getMonth() === end.getMonth())
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()}–${end.getDate()}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export function CalendarPage() {
  const {
    schedule, removeFromSchedule, markComplete,
    savedTemplates, addToSchedule, completedSessions,
  } = useApp();
  const navigate = useNavigate();

  const weekMonday = getWeekMonday();
  const todayIdx   = getTodayDOW();

  const [stripStart, setStripStart] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayIdx);

  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [selectedModalDays, setSelectedModalDays] = useState<number[]>([]);
  const [rescheduleItemId, setRescheduleItemId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [modalMonth, setModalMonth] = useState<Date>(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // ── LOGIKA ──
  const selectedDate    = idxToDate(selectedDay, weekMonday);
  const selectedDateStr = getTodayStr(selectedDate);
  const isPastDay       = selectedDay < todayIdx;
  const isToday         = selectedDay === todayIdx;

  // 1. Tervezett edzések (Múltban nem mutatjuk a be nem fejezetteket)
  const plannedForDay = schedule.filter(s => s.dayIndex === selectedDay && !s.completed);
  
  // 2. Ténylegesen elvégzett edzések
  const doneForDay = completedSessions
    .filter(cs => cs.date === selectedDateStr)
    .map((cs, idx) => ({
      id: `done-${cs.workoutId}-${idx}`,
      workoutId: cs.workoutId,
      completed: true,
      calories: cs.calories,
      duration: cs.duration
    }));

  // Ha múltbeli nap van, CSAK a done elemeket mutatjuk
  const combinedItems = isPastDay ? doneForDay : [...doneForDay, ...plannedForDay];

  const savedWorkouts = savedTemplates
    .map(id => workouts.find(w => w.id === id))
    .filter((w): w is Workout => !!w);

  const recommendations = workouts
    .filter(w => !savedTemplates.includes(w.id))
    .slice(0, 3);

  const dayCalories = doneForDay.reduce((a, s) => a + s.calories, 0);
  const dayTime = doneForDay.reduce((a, s) => a + s.duration, 0);
  const dayDone = doneForDay.length;

  const hasWorkout = (idx: number) => {
    const dStr = getTodayStr(idxToDate(idx, weekMonday));
    return schedule.some(s => s.dayIndex === idx) || completedSessions.some(cs => cs.date === dStr);
  };

  const stripDays = Array.from({ length: 7 }, (_, j) => stripStart + j);
  const weekLabel = stripStart === 0 ? "This Week" : formatWeekLabel(stripStart, weekMonday);
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
      if (rescheduleItemId) removeFromSchedule(rescheduleItemId);
      selectedModalDays.forEach(dayIdx => addToSchedule(scheduleModal, dayIdx));
    }
    closeScheduleModal();
  };

  return (
    <div className="bg-background px-4 pt-12 pb-6 min-h-screen transition-colors duration-300">
      <AnimatePresence>
        {activeWorkout && <ActiveWorkoutView workout={activeWorkout} onClose={() => setActiveWorkout(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-5 px-2">
        <p className="text-muted-foreground text-sm">Plan & Track</p>
        <h1 className="text-foreground text-2xl font-bold mt-0.5">Workout <span style={{ color: ACCENT }}>Calendar</span></h1>
      </div>

      {/* Stats */}
      <div className="mb-5 px-2">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>This day</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "kcal",    value: dayCalories, icon: Flame,       color: "#FF6B35" },
            { label: "min",     value: dayTime,     icon: Clock,       color: "#3B82F6" },
            { label: "done",    value: dayDone,     icon: CheckSquare, color: ACCENT    },
            { label: "planned", value: isPastDay ? 0 : plannedForDay.length, icon: Calendar,    color: "#A855F7" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl flex flex-col items-center gap-1 bg-card border border-border">
              <s.icon size={13} style={{ color: s.color }} />
              <p className="text-foreground text-base font-bold">{s.value}</p>
              <p className="text-muted-foreground text-[9px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Week navigator */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setStripStart(s => s - 7)} className="w-8 h-8 rounded-xl flex items-center justify-center bg-card border border-border transition-colors hover:bg-muted">
            <ChevronLeft size={15} className="text-muted-foreground" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-foreground text-sm font-semibold">{weekLabel}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">{formatWeekLabel(stripStart, weekMonday)}</p>
          </div>
          <button onClick={() => setStripStart(s => s + 7)} className="w-8 h-8 rounded-xl flex items-center justify-center bg-card border border-border transition-colors hover:bg-muted">
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {stripDays.map(idx => {
            const date = idxToDate(idx, weekMonday);
            const dow = date.getDay() === 0 ? 6 : date.getDay() - 1;
            const curIsToday = idx === todayIdx;
            const curIsSel = idx === selectedDay;
            const hasWork = hasWorkout(idx);

            return (
              <button key={idx} onClick={() => setSelectedDay(idx)} className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all"
                style={{
                  background: curIsSel ? ACCENT : "var(--card)",
                  border: `1px solid ${curIsSel ? ACCENT : curIsToday ? "var(--muted-foreground)" : "var(--border)"}`,
                }}
              >
                <span className="text-[9px] font-semibold" style={{ color: curIsSel ? "#000" : "var(--muted-foreground)" }}>{dayNames[dow]}</span>
                <span className="text-sm font-bold" style={{ color: curIsSel ? "#000" : curIsToday ? ACCENT : "var(--foreground)" }}>{date.getDate()}</span>
                {hasWork && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: curIsSel ? "#000" : ACCENT }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day list */}
      <div className="mb-6 px-2">
        <h2 className="text-foreground text-base font-semibold mb-3">{selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</h2>
        <AnimatePresence mode="popLayout">
          {combinedItems.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center gap-3 bg-card border border-border rounded-2xl">
              <Calendar size={30} className="text-muted-foreground" />
              <p className="text-muted-foreground text-sm">{isPastDay ? "No activities recorded" : "No activities scheduled"}</p>
            </motion.div>
          ) : (
            combinedItems.map((item: any) => {
              const workout = workouts.find(w => w.id === item.workoutId);
              if (!workout) return null;
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-3 p-4 rounded-2xl bg-card border border-border"
                  style={{ opacity: item.completed ? 0.7 : 1 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${categoryColor(workout.category)}18`, color: categoryColor(workout.category) }}>
                        {workout.category.toUpperCase()}
                      </span>
                      <h3 className={`font-semibold mt-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{workout.name}</h3>
                    </div>
                    {item.completed ? <Check size={18} style={{ color: ACCENT }} /> : (
                      <button onClick={() => openScheduleModal(workout.id, item.id)} className="text-muted-foreground hover:text-foreground text-[10px] font-semibold px-2.5 py-1.5 rounded-md bg-muted border border-border">Reschedule</button>
                    )}
                  </div>
                  <div className="flex gap-3 mb-3 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1"><Clock size={10} /> {workout.duration} min</span>
                    <span className="flex items-center gap-1"><Flame size={10} /> {workout.calories} kcal</span>
                  </div>
                  {!item.completed && (
                    <div className="flex gap-2">
                      <button onClick={() => setActiveWorkout(workout)} className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-black" style={{ background: ACCENT }}><Play size={12} fill="#000" strokeWidth={0} /> Start</button>
                      <button onClick={() => markComplete(item.id)} className="flex-1 py-2 rounded-xl text-xs font-semibold border border-border text-foreground hover:bg-muted">Done</button>
                      <button onClick={() => setDeleteConfirmId(item.id)} className="w-10 shrink-0 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Saved Templates & Recommendations - Múltban elrejtve */}
      {!isPastDay && (
        <>
          {savedWorkouts.length > 0 && (
            <div className="mb-6 px-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-foreground text-base font-semibold">Saved Templates</h2>
                <Bookmark size={14} style={{ color: ACCENT }} />
              </div>
              <div className="flex flex-col gap-3">
                {savedWorkouts.map(workout => (
                  <div key={workout.id} className="p-4 rounded-2xl flex items-center justify-between bg-card border border-border">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-foreground text-sm font-semibold truncate">{workout.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{workout.duration} min · {workout.calories} kcal</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setActiveWorkout(workout)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}><Play size={12} fill="#000" strokeWidth={0} /></button>
                      <button onClick={() => addToSchedule(workout.id, selectedDay)} className="w-8 h-8 rounded-lg flex items-center justify-center border border-border transition-colors"><Plus size={14} style={{ color: ACCENT }} /></button>
                      <button onClick={() => openScheduleModal(workout.id)} className="px-2.5 h-8 rounded-lg text-[11px] font-semibold flex items-center gap-1 text-muted-foreground border border-border transition-colors"><Calendar size={11} /> Schedule</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 px-2">
            <h2 className="text-foreground text-base font-semibold mb-3">Recommended</h2>
            <div className="flex flex-col gap-3">
              {recommendations.map(workout => (
                <div key={workout.id} className="p-4 rounded-2xl flex items-center justify-between bg-card border border-border">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-foreground text-sm font-semibold truncate">{workout.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 capitalize">{workout.category} · {workout.level}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setActiveWorkout(workout)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}><Play size={12} fill="#000" strokeWidth={0} /></button>
                    <button onClick={() => addToSchedule(workout.id, selectedDay)} className="w-8 h-8 rounded-lg flex items-center justify-center border border-border"><Plus size={14} style={{ color: ACCENT }} /></button>
                    <button onClick={() => openScheduleModal(workout.id)} className="px-2.5 h-8 rounded-lg text-[11px] font-semibold flex items-center gap-1 text-muted-foreground border border-border"><Calendar size={11} /> Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80" onClick={() => setDeleteConfirmId(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-[320px] rounded-3xl p-6 text-center bg-card border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
              <Trash2 size={32} className="text-destructive mx-auto mb-4" />
              <h3 className="text-foreground text-lg font-bold mb-2">Delete Workout?</h3>
              <p className="text-muted-foreground text-sm mb-6">Remove this from your schedule.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl border border-border text-foreground">Cancel</button>
                <button onClick={() => { if(deleteConfirmId) removeFromSchedule(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 py-3 rounded-xl bg-destructive text-white">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Picker Modal */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center pb-[100px] px-4 bg-black/80"
            onClick={closeScheduleModal}>
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="w-full max-w-[430px] rounded-3xl bg-card border border-border flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-5 pt-5 pb-3 border-b border-border">
                <h3 className="text-foreground text-lg font-bold">Schedule Workout</h3>
                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => setModalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2"><ChevronLeft size={14} /></button>
                  <span className="text-sm font-semibold">{MONTH_NAMES[modalMonth.getMonth()]} {modalMonth.getFullYear()}</span>
                  <button onClick={() => setModalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2"><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 gap-1">
                  {modalGrid.map((date, i) => {
                    if (!date) return <div key={i} />;
                    const idx = dateToIdx(date, weekMonday);
                    const isPast = idx < todayIdx;
                    const isSelected = selectedModalDays.includes(idx);
                    return (
                      <button key={i} disabled={isPast} onClick={() => setSelectedModalDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])}
                        className={`py-2 rounded-xl text-xs transition-all ${isSelected ? 'bg-accent text-black font-bold' : isPast ? 'opacity-20 pointer-events-none' : 'bg-muted'}`}
                        style={{ background: isSelected ? ACCENT : undefined }}>
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t border-border">
                <button onClick={handleScheduleConfirm} className="w-full py-3 rounded-2xl font-bold text-black" style={{ background: ACCENT }}>Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}