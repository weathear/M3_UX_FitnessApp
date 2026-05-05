import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, Clock, CheckSquare, Calendar, Play, ChevronRight,
  Zap, Award, Dumbbell, BarChart2
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { quotes, workouts, Workout } from "../data/mockData";
import { useNavigate } from "react-router";
import { ActiveWorkoutView } from "../components/workout/ActiveWorkoutView";

const ACCENT = "#CCFF00";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function getDayName() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[getTodayIndex()];
}

const categoryColor = (cat: string) => {
  if (cat === "strength") return "#FF6B35";
  if (cat === "cardio") return "#FF3B6B";
  return ACCENT;
};

const categoryLabel = (cat: string) => {
  if (cat === "strength") return "Strength";
  if (cat === "cardio") return "Cardio";
  return "Stretching";
};

export function HomePage() {
  const { userProfile, completedSessions, schedule } = useApp();
  const navigate = useNavigate();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  const [quote] = useState(() => {
    const dayOfYear = Math.floor(Date.now() / 86400000);
    return quotes[dayOfYear % quotes.length];
  });

  const todayIndex = getTodayIndex();
  const todaySchedule = schedule.filter(s => s.dayIndex === todayIndex && !s.completed);
  const todayWorkout = todaySchedule.length > 0
    ? workouts.find(w => w.id === todaySchedule[0].workoutId)
    : null;

  // Weekly stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = completedSessions.filter(s => {
    const d = new Date(s.date);
    return d >= weekAgo && d <= now;
  });

  const weekCalories = weekSessions.reduce((a, s) => a + s.calories, 0);
  const weekTime = weekSessions.reduce((a, s) => a + s.duration, 0);
  const weekCompleted = weekSessions.length;
  const weekDays = new Set(weekSessions.map(s => s.date)).size;

  const displayName = userProfile.name || "Athlete";

  const statCards = [
    { label: "Calories", value: weekCalories > 0 ? weekCalories.toLocaleString() : "0", unit: "kcal", icon: Flame, color: "#FF6B35" },
    { label: "Time", value: String(weekTime), unit: "min", icon: Clock, color: "#3B82F6" },
    { label: "Workouts", value: String(weekCompleted), unit: "done", icon: CheckSquare, color: ACCENT },
    { label: "Active", value: String(weekDays), unit: "days", icon: Calendar, color: "#A855F7" },
  ];

  return (
    <>
      {/* Active Workout Overlay */}
      <AnimatePresence>
        {activeWorkout && (
          <ActiveWorkoutView workout={activeWorkout} onClose={() => setActiveWorkout(null)} />
        )}
      </AnimatePresence>

      {/* Scrollable viewport dashboard */}
      <div
        className="bg-[#09090B] flex flex-col px-6 overflow-y-auto overflow-x-hidden"
        style={{
          height: "100%",
          paddingTop: "max(40px, env(safe-area-inset-top, 40px))",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 54px)",
          /* AZ OVERFLOW: HIDDEN TÖRÖLVE LETT INNEN, ÉS BEKERÜLT A CLASSNAME-BE AZ overflow-y-auto */
        }}
      >
        {/* ── HEADER ROW ── greeting + date on one line */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between shrink-0 mb-3"
        >
          <div>
            <h1 className="text-white text-xl font-bold leading-tight">
              {getGreeting()},{" "}
              <span style={{ color: ACCENT }}>{displayName}</span>
              <span className="text-[#52525B]" style={{ fontSize: "0.7rem", fontWeight: 400 }}>
                {" "}·{" "}{getDayName().slice(0, 3)},{" "}
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </h1>
          </div>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}40` }}
          >
            <Zap size={15} style={{ color: ACCENT }} />
          </motion.div>
        </motion.div>

        {/* ── DAILY MOTIVATION ── expanded */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="shrink-0 rounded-2xl relative overflow-hidden mb-9"
          style={{ background: "#111113", border: "1px solid #27272A" }}
        >
          {/* Left accent bar */}
          <div
            className="absolute top-0 left-0 w-[3px] h-full"
            style={{ background: ACCENT }}
          />
          <div className="pl-4 pr-4 py-4">
            <p className="text-[#A1A1AA] text-[9px] uppercase tracking-widest mb-2">Daily Motivation</p>
            <p className="text-[#E4E4E7] text-sm italic leading-relaxed line-clamp-3">
              "{quote.text}"
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: ACCENT, color: "#000" }}
              >
                {quote.author[0]}
              </div>
              <p className="text-[#A1A1AA] text-[11px]">
                <span className="text-white font-semibold">{quote.author}</span>
                {" "}· {quote.title}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── STATS SECTION ── 2×2 grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="shrink-0 mb-9"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#A1A1AA] text-xs font-semibold">This Week</p>
            <div className="flex items-center gap-1">
              <BarChart2 size={10} style={{ color: "#A1A1AA" }} />
              <p className="text-[#A1A1AA] text-[10px]">Last 7 days</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.18 + i * 0.04, duration: 0.35 }}
                className="rounded-2xl flex items-center gap-3 px-4 py-3"
                style={{ background: "#111113", border: "1px solid #27272A" }}
              >
                <card.icon size={16} style={{ color: card.color }} />
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-white font-bold" style={{ fontSize: "1.25rem" }}>{card.value}</p>
                    <p className="text-[10px]" style={{ color: card.color, opacity: 0.7 }}>{card.unit}</p>
                  </div>
                  <p className="text-[#A1A1AA] text-[10px]">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── TODAY'S WORKOUT ── shrinks to content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45 }}
          className="shrink-0 rounded-2xl overflow-hidden mb-6" // Kicsi margin alulra a biztonság kedvéért (mb-6)
          style={{ background: "#111113", border: "1px solid #27272A" }}
        >
          {todayWorkout ? (
            <WorkoutCard
              workout={todayWorkout}
              onStart={() => setActiveWorkout(todayWorkout)}
            />
          ) : (
            <RestDayCard onBrowse={() => navigate("/app/browse")} />
          )}
        </motion.div>
      </div>
    </>
  );
}

// ── Today's Workout Card (filled) ──────────────────────────────────────────

function WorkoutCard({ workout, onStart }: { workout: Workout; onStart: () => void }) {
  const catColor = categoryColor(workout.category);

  return (
    <div className="flex flex-col px-5 pt-4 pb-5">
      {/* Section label */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className="text-[#A1A1AA] text-xs font-semibold tracking-wide">Today's Workout</p>
        <Award size={14} style={{ color: ACCENT }} />
      </div>

      {/* Category + title */}
      <div className="shrink-0 mb-2">
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${catColor}18`, color: catColor }}
        >
          {categoryLabel(workout.category).toUpperCase()}
        </span>
        <h2
          className="text-white font-bold mt-1.5 leading-tight"
          style={{ fontSize: "clamp(1rem, 4vw, 1.15rem)" }}
        >
          {workout.name}
        </h2>
      </div>

      {/* Stats pills row */}
      <div className="flex gap-2 shrink-0 mb-2">
        {[
          { icon: Clock, value: workout.duration, unit: "min", color: "#3B82F6" },
          { icon: Flame, value: workout.calories, unit: "kcal", color: "#FF6B35" },
          { icon: Dumbbell, value: workout.exerciseCount, unit: "exercises", color: "#A855F7" },
        ].map(({ icon: Icon, value, unit, color }) => (
          <div
            key={unit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
            style={{ background: "#1C1C1E", border: "1px solid #27272A" }}
          >
            <Icon size={11} style={{ color }} strokeWidth={1.5} />
            <span className="text-white text-xs font-semibold">{value}</span>
            <span className="text-[#A1A1AA] text-[10px]">{unit}</span>
          </div>
        ))}
      </div>

      {/* Description — 2 lines max */}
      <p className="text-[#71717A] text-xs leading-relaxed line-clamp-2 shrink-0 mb-4">
        {workout.description}
      </p>

      {/* Primary CTA */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="w-full rounded-2xl flex items-center justify-center gap-2.5 font-bold text-black shrink-0"
        style={{ background: ACCENT, height: 56 }}
      >
        <Play size={20} fill="#000" strokeWidth={0} />
        <span style={{ fontSize: "1rem" }}>Start Workout</span>
      </motion.button>
    </div>
  );
}

// ── Rest Day Card ──────────────────────────────────────────────────────────

function RestDayCard({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col h-full px-5 pt-4 pb-5">
      {/* Section label */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-[#A1A1AA] text-xs font-semibold tracking-wide">Today's Workout</p>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap size={36} style={{ color: ACCENT }} />
          </motion.div>
        </div>

        <div>
          <p className="text-white font-bold text-lg">Rest Day</p>
          <p className="text-[#71717A] text-sm mt-1 leading-relaxed">
            Recovery is part of the process. Your muscles grow when you rest.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBrowse}
          className="w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-black"
          style={{ background: ACCENT, height: 56 }}
        >
          Browse Workouts <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}