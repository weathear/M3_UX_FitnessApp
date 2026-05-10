import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, Clock, Dumbbell, Play, Bookmark, BookmarkCheck, Calendar,
  X, Youtube, CheckCircle2, AlertCircle, ArrowLeft,
  Plus, Check, SlidersHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { workouts, exercises, dayNames, fullDayNames, Exercise, Workout } from "../data/mockData";
import { ActiveWorkoutView } from "../components/workout/ActiveWorkoutView";

const ACCENT = "#CCFF00";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Helper Functions ────────────────────────────────────────────────────────

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
  if (cat === "cardio") return "#FF3B6B";
  return ACCENT;
}

function levelColor(level: string) {
  if (level === "beginner") return "#22C55E";
  if (level === "intermediate") return "#F59E0B";
  return "#EF4444";
}

const QUICK_CATEGORIES = [
  { id: "all-cat", label: "All", catFilter: "all", levelFilter: "all", typeFilter: "all" },
  { id: "strength", label: "💪 Strength", catFilter: "strength", levelFilter: "all", typeFilter: "all" },
  { id: "cardio", label: "🏃 Cardio", catFilter: "cardio", levelFilter: "all", typeFilter: "all" },
  { id: "stretching", label: "🧘 Stretching", catFilter: "stretching", levelFilter: "all", typeFilter: "all" },
  { id: "beginner", label: "Beginner", catFilter: "all", levelFilter: "beginner", typeFilter: "all" },
  { id: "advanced", label: "Advanced", catFilter: "all", levelFilter: "advanced", typeFilter: "all" },
  { id: "weekly", label: "📅 Weekly Plans", catFilter: "all", levelFilter: "all", typeFilter: "weekly" },
];

export function BrowsePage() {
  const { savedTemplates, saveTemplate, removeTemplate, addToSchedule } = useApp();

  const [catFilter, setCatFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeQuick, setActiveQuick] = useState("all-cat");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [detailWorkout, setDetailWorkout] = useState<Workout | null>(null);
  const [demoExercise, setDemoExercise] = useState<Exercise | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Calendar Modal States
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [selectedModalDays, setSelectedModalDays] = useState<number[]>([]);
  const [modalMonth, setModalMonth] = useState<Date>(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });

  const weekMonday = getWeekMonday();
  const todayIdx   = getTodayDOW();
  const modalGrid  = buildMonthGrid(modalMonth.getFullYear(), modalMonth.getMonth());

  const filtered = workouts.filter(w => {
    if (catFilter !== "all" && w.category !== catFilter) return false;
    if (levelFilter !== "all" && w.level !== levelFilter) return false;
    if (typeFilter !== "all" && w.type !== typeFilter) return false;
    return true;
  });

  const hasActiveFilters = catFilter !== "all" || levelFilter !== "all" || typeFilter !== "all";

  const openScheduleModal = (workoutId: string) => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
    setModalMonth(d);
    setSelectedModalDays([]);
    setScheduleModal(workoutId);
  };

  const closeScheduleModal = () => {
    setScheduleModal(null);
    setSelectedModalDays([]);
  };

  const handleScheduleConfirm = () => {
    if (scheduleModal) {
      selectedModalDays.forEach(dayIdx => {
        addToSchedule(scheduleModal, dayIdx);
      });
    }
    closeScheduleModal();
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Active Workout Overlay */}
      <AnimatePresence>
        {activeWorkout && (
          <ActiveWorkoutView workout={activeWorkout} onClose={() => setActiveWorkout(null)} />
        )}
      </AnimatePresence>

      {/* Workout Detail Modal */}
      <AnimatePresence>
        {detailWorkout && !activeWorkout && (
          <WorkoutDetailModal
            workout={detailWorkout}
            onClose={() => setDetailWorkout(null)}
            onStart={() => { setActiveWorkout(detailWorkout); }}
            onDemo={(ex) => setDemoExercise(ex)}
          />
        )}
      </AnimatePresence>

      {/* Exercise Demo Modal */}
      <AnimatePresence>
        {demoExercise && (
          <ExerciseDemoModal exercise={demoExercise} onClose={() => setDemoExercise(null)} />
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center pb-[100px] px-4"
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
                    <h3 className="text-foreground text-lg font-bold">Schedule Workout</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Select one or more future days</p>
                  </div>
                  <button onClick={closeScheduleModal}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground bg-muted">
                    ✕
                  </button>
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
                          background: isSelected ? ACCENT : isPast ? "var(--muted)" : isToday ? `${ACCENT}18` : "var(--muted)",
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
                    ? `Schedule for ${selectedModalDays.length} day${selectedModalDays.length > 1 ? 's' : ''}` 
                    : "Select days to schedule"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.85)", touchAction: "none" }} 
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-[430px] rounded-t-3xl flex flex-col overflow-hidden bg-card border-x border-t border-border" 
              style={{ maxHeight: "85vh" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="pt-5 px-6 pb-2 shrink-0">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-5" />
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-bold">Filters</h3>
                  <button
                    onClick={() => { setCatFilter("all"); setLevelFilter("all"); setTypeFilter("all"); setActiveQuick("all-cat"); }}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ color: ACCENT, background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div 
                className="px-6 py-4 flex-1 overflow-y-auto" 
                style={{ 
                  minHeight: 0,
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                  overscrollBehavior: "contain",
                  scrollbarWidth: "none"
                }}
              >
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Category</p>
                <div className="flex gap-2 flex-wrap mb-6">
                  {["all", "strength", "cardio", "stretching"].map(v => (
                    <button key={v} onClick={() => setCatFilter(v)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{ background: catFilter === v ? ACCENT : "var(--muted)", color: catFilter === v ? "#000" : "var(--muted-foreground)", border: `1px solid ${catFilter === v ? ACCENT : "var(--border)"}` }}>
                      {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>

                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Level</p>
                <div className="flex gap-2 flex-wrap mb-6">
                  {["all", "beginner", "intermediate", "advanced"].map(v => (
                    <button key={v} onClick={() => setLevelFilter(v)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{ background: levelFilter === v ? ACCENT : "var(--muted)", color: levelFilter === v ? "#000" : "var(--muted-foreground)", border: `1px solid ${levelFilter === v ? ACCENT : "var(--border)"}` }}>
                      {v === "all" ? "All Levels" : v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>

                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Type</p>
                <div className="flex gap-2 flex-wrap mb-2">
                  {["all", "single", "weekly", "monthly"].map(v => (
                    <button key={v} onClick={() => setTypeFilter(v)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{ background: typeFilter === v ? ACCENT : "var(--muted)", color: typeFilter === v ? "#000" : "var(--muted-foreground)", border: `1px solid ${typeFilter === v ? ACCENT : "var(--border)"}` }}>
                      {v === "all" ? "All Types" : v === "single" ? "Single" : v === "weekly" ? "7-Day Plan" : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                className="px-6 pt-4 shrink-0 bg-card border-t border-border" 
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 90px)" }}
              >
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full py-3.5 rounded-2xl font-semibold text-black"
                  style={{ background: ACCENT }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="px-6 pt-12 pb-32">
        <div className="mb-5">
          <p className="text-muted-foreground text-sm">Discover</p>
          <h1 className="text-foreground text-2xl font-bold mt-0.5">Browse <span style={{ color: ACCENT }}>Workouts</span></h1>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: hasActiveFilters ? `${ACCENT}15` : "var(--muted)",
              border: `1px solid ${hasActiveFilters ? ACCENT : "var(--border)"}`,
              color: hasActiveFilters ? ACCENT : "var(--muted-foreground)",
            }}
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            Filter
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-black" style={{ background: ACCENT }}>
                {[catFilter !== "all", levelFilter !== "all", typeFilter !== "all"].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {catFilter !== "all" && (
              <button
                key="chip-cat"
                onClick={() => { setCatFilter("all"); setActiveQuick("all-cat"); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
                style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}60` }}
              >
                {catFilter.charAt(0).toUpperCase() + catFilter.slice(1)}
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
            {levelFilter !== "all" && (
              <button
                key="chip-level"
                onClick={() => { setLevelFilter("all"); setActiveQuick("all-cat"); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
                style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}60` }}
              >
                {levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)}
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
            {typeFilter !== "all" && (
              <button
                key="chip-type"
                onClick={() => { setTypeFilter("all"); setActiveQuick("all-cat"); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
                style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}60` }}
              >
                {typeFilter === "single" ? "Single" : typeFilter === "weekly" ? "7-Day Plan" : "Monthly"}
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-xs mb-3">{filtered.length} workout{filtered.length !== 1 ? "s" : ""} found</p>

        <div className="flex flex-col gap-3">
          {filtered.map((workout, i) => {
            const isSaved = savedTemplates.includes(workout.id);
            return (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${categoryColor(workout.category)}18`, color: categoryColor(workout.category) }}
                    >
                      {workout.category.toUpperCase()}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${levelColor(workout.level)}18`, color: levelColor(workout.level) }}
                    >
                      {workout.level.toUpperCase()}
                    </span>
                    {workout.type !== "single" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {workout.type === "weekly" ? "7-DAY PLAN" : "MONTHLY PLAN"}
                      </span>
                    )}
                  </div>
                  <button onClick={() => isSaved ? removeTemplate(workout.id) : saveTemplate(workout.id)}>
                    {isSaved
                      ? <BookmarkCheck size={17} style={{ color: ACCENT }} />
                      : <Bookmark size={17} className="text-muted-foreground" />}
                  </button>
                </div>
                <h3 className="text-foreground font-bold text-base mb-1">{workout.name}</h3>
                <p className="text-muted-foreground text-xs mb-3 leading-relaxed">{workout.description}</p>
                <div className="flex gap-4 mb-4">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Clock size={11} strokeWidth={1.5} /> <span>{workout.duration}</span><span className="text-[10px] text-muted-foreground/70">min</span>
                  </span>
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Flame size={11} strokeWidth={1.5} /> <span>{workout.calories}</span><span className="text-[10px] text-muted-foreground/70">kcal</span>
                  </span>
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Dumbbell size={11} strokeWidth={1.5} /> {workout.exerciseCount} ex.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openScheduleModal(workout.id)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Calendar size={12} strokeWidth={1.5} /> Schedule
                  </button>
                  <button
                    onClick={() => setDetailWorkout(workout)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-black"
                    style={{ background: ACCENT }}
                  >
                    <Play size={12} fill="#000" strokeWidth={0} /> Start
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Workout Detail Modal ────────────────────────────────────────────────────

function WorkoutDetailModal({ workout, onClose, onStart, onDemo }: {
  workout: Workout;
  onClose: () => void;
  onStart: () => void;
  onDemo: (ex: Exercise) => void;
}) {
  const workoutExercises = workout.exerciseIds
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean) as Exercise[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-background flex flex-col max-w-[430px] mx-auto"
    >
      <div className="px-6 pt-12 pb-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted border border-border"
        >
          <ArrowLeft size={16} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h2 className="text-foreground font-bold text-lg leading-tight">{workout.name}</h2>
          <p className="text-muted-foreground text-xs capitalize">{workout.category} · {workout.level} · {workout.duration} min</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-6 mb-5 p-4 rounded-2xl bg-card border border-border">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-foreground font-bold text-lg">{workout.duration}</span>
            <span className="text-muted-foreground text-[10px]">min</span>
          </div>
          <div className="w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-foreground font-bold text-lg">{workout.calories}</span>
            <span className="text-muted-foreground text-[10px]">kcal</span>
          </div>
          <div className="w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-foreground font-bold text-lg">{workout.exerciseCount}</span>
            <span className="text-muted-foreground text-[10px]">exercises</span>
          </div>
        </div>

        <h3 className="text-foreground font-semibold text-sm mb-3">Exercises</h3>
        <div className="flex flex-col gap-3 mb-6">
          {workoutExercises.map((ex, i) => (
            <div
              key={ex.id}
              className="p-4 rounded-2xl flex items-center gap-3 bg-card border border-border"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-black shrink-0"
                style={{ background: ACCENT }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm truncate">{ex.name}</p>
                <p className="text-muted-foreground text-xs">
                  {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps} reps` : ex.durationSec ? `${ex.durationSec}s` : ""}
                  {" · "}{ex.muscleGroups.slice(0, 2).join(", ")}
                </p>
              </div>
              <button
                onClick={() => onDemo(ex)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Demo
              </button>
            </div>
          ))}
        </div>
      </div>

      <div 
        className="px-6 pt-4 shrink-0 bg-background border-t border-border" 
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 90px)" }}
      >
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-semibold text-black text-base flex items-center justify-center gap-2"
          style={{ background: ACCENT }}
        >
          <Play size={18} fill="#000" strokeWidth={0} /> Start Workout
        </button>
      </div>
    </motion.div>
  );
}

// ─── Exercise Demo Modal ─────────────────────────────────────────────────────

function ExerciseDemoModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden bg-card border border-border flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        <div 
          className="overflow-y-auto px-5" 
          style={{ 
            scrollbarWidth: "none",
            paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 90px)"
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-foreground text-xl font-bold">{exercise.name}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {exercise.muscleGroups.map(m => (
                  <span key={m} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 rounded-2xl mb-4 bg-muted border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
                style={{ background: ACCENT }}
              >
                {exercise.expert.name[0]}
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">{exercise.expert.name}</p>
                <p className="text-muted-foreground text-xs">{exercise.expert.title}</p>
              </div>
            </div>
            <p className="text-foreground text-xs italic leading-relaxed">
              "{exercise.expert.tip}"
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: ACCENT }} /> Proper Form
            </h3>
            <div className="flex flex-col gap-2">
              {exercise.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: ACCENT, color: "#000" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
              <AlertCircle size={14} style={{ color: "#EF4444" }} /> Common Mistakes
            </h3>
            <div className="flex flex-col gap-2">
              {exercise.commonMistakes.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <X size={14} className="shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
                  <p className="text-muted-foreground text-sm">{m}</p>
                </div>
              ))}
            </div>
          </div>

          {exercise.youtubeId && (
            <div className="mb-2">
              {showVideo ? (
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                    title={exercise.name}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold"
                  style={{ background: "#FF0000", color: "#fff" }}
                >
                  <Youtube size={18} /> Watch Tutorial on YouTube
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}