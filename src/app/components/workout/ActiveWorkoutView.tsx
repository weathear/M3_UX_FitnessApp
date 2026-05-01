import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Timer, Check, CheckCircle2, Plus, Minus } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { exercises, Workout } from "../../data/mockData";

const ACCENT = "#CCFF00";

interface Props {
  workout: Workout;
  onClose: () => void;
}

export function ActiveWorkoutView({ workout, onClose }: Props) {
  const { logWeight, getBestWeight, getLastWeight, addCompletedSession } = useApp();

  const workoutExercises = workout.exerciseIds
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean) as typeof exercises;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [weightInputs, setWeightInputs] = useState<Record<number, string>>({});
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && !finished) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, finished]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const current = workoutExercises[currentIdx];
  const bestWeight = current?.isStrength ? getBestWeight(current.id) : null;
  const lastWeight = current?.isStrength ? getLastWeight(current.id) : null;

  const markExerciseDone = () => {
    if (current?.isStrength) {
      const w = parseFloat(weightInputs[currentIdx] || "0");
      if (w > 0) logWeight(current.id, w);
    }
    setCompleted(prev => new Set([...prev, currentIdx]));
    if (currentIdx < workoutExercises.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setFinished(true);
      setRunning(false);
      addCompletedSession({
        workoutId: workout.id,
        date: new Date().toISOString().split("T")[0],
        calories: workout.calories,
        duration: Math.round(seconds / 60) || 1,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-[100] bg-[#09090B] flex flex-col"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      {/* Header */}
      <div
        className="px-6 pt-12 pb-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid #27272A" }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#1C1C1E", border: "1px solid #27272A" }}
        >
          <X size={16} style={{ color: "#A1A1AA" }} />
        </button>
        <div className="text-center">
          <p className="text-[#A1A1AA] text-xs">Active Workout</p>
          <p className="text-white font-bold text-sm">{workout.name}</p>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
          style={{ background: "#1C1C1E", border: "1px solid #27272A" }}
        >
          <Timer size={12} style={{ color: ACCENT }} />
          <span className="text-white text-sm font-mono font-bold">{formatTime(seconds)}</span>
        </div>
      </div>

      {finished ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: `${ACCENT}20`, border: `3px solid ${ACCENT}` }}
          >
            <CheckCircle2 size={40} style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">Workout Complete!</h2>
            <p className="text-[#555] text-sm mt-1">Great job crushing it today!</p>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-bold text-xl">{formatTime(seconds)}</span>
              <span className="text-[#A1A1AA] text-xs">Time</span>
            </div>
            <div className="w-px bg-[#27272A]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-bold text-xl">{workout.calories}</span>
              <span className="text-[#A1A1AA] text-xs">kcal burned</span>
            </div>
            <div className="w-px bg-[#27272A]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-bold text-xl">{workoutExercises.length}</span>
              <span className="text-[#A1A1AA] text-xs">exercises</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-semibold text-black text-lg"
            style={{ background: ACCENT }}
          >
            Done
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="px-4 py-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#555] text-xs">
                Exercise {currentIdx + 1} of {workoutExercises.length}
              </span>
              <span className="text-xs" style={{ color: ACCENT }}>{completed.size} done</span>
            </div>
            <div className="h-1 bg-[#27272A] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: ACCENT }}
                animate={{ width: `${(currentIdx / workoutExercises.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: "none" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-2xl mb-4"
                style={{ background: `${ACCENT}0D`, border: `1.5px solid ${ACCENT}30` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{ background: ACCENT }}
                  >
                    {currentIdx + 1}
                  </div>
                  <span className="text-[#A1A1AA] text-xs uppercase tracking-wider">Current</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-1">{current?.name}</h3>
                <p className="text-[#A1A1AA] text-sm mb-4">
                  {current?.sets && current?.reps
                    ? `${current.sets} sets × ${current.reps} reps`
                    : current?.durationSec ? `${current.durationSec} seconds` : ""}
                  {" · "}{current?.muscleGroups.slice(0, 2).join(", ")}
                </p>

                {current?.isStrength && (
                  <div className="mb-4">
                    <p className="text-[#666] text-xs mb-2">Weight used (kg)</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const cur = parseFloat(weightInputs[currentIdx] || "0");
                          setWeightInputs(p => ({ ...p, [currentIdx]: String(Math.max(0, cur - 2.5)) }));
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "#1C1C1E", border: "1px solid #27272A" }}
                      >
                        <Minus size={16} style={{ color: "#A1A1AA" }} />
                      </button>
                      <input
                        type="number"
                        value={weightInputs[currentIdx] || ""}
                        onChange={e => setWeightInputs(p => ({ ...p, [currentIdx]: e.target.value }))}
                        placeholder="0"
                        className="flex-1 text-center rounded-xl py-2 text-white font-bold text-xl outline-none"
                        style={{ background: "#1C1C1E", border: "1px solid #27272A" }}
                        onFocus={e => (e.target.style.borderColor = ACCENT)}
                        onBlur={e => (e.target.style.borderColor = "#27272A")}
                      />
                      <button
                        onClick={() => {
                          const cur = parseFloat(weightInputs[currentIdx] || "0");
                          setWeightInputs(p => ({ ...p, [currentIdx]: String(cur + 2.5) }));
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "#1C1C1E", border: "1px solid #27272A" }}
                      >
                        <Plus size={16} style={{ color: ACCENT }} />
                      </button>
                    </div>
                    {(bestWeight !== null || lastWeight !== null) && (
                      <div className="flex gap-4 mt-2">
                        {lastWeight !== null && (
                          <p className="text-[#A1A1AA] text-xs">Last: <span className="text-[#A1A1AA]">{lastWeight} kg</span></p>
                        )}
                        {bestWeight !== null && (
                          <p className="text-[#A1A1AA] text-xs">Best: <span style={{ color: ACCENT }}>{bestWeight} kg</span></p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={markExerciseDone}
                  className="w-full py-3.5 rounded-2xl font-semibold text-black flex items-center justify-center gap-2"
                  style={{ background: ACCENT }}
                >
                  <Check size={18} />
                  {currentIdx === workoutExercises.length - 1 ? "Finish Workout" : "Complete & Next"}
                </button>
              </motion.div>
            </AnimatePresence>

            {workoutExercises.slice(currentIdx + 1).length > 0 && (
              <div className="mb-4">
                <p className="text-[#A1A1AA] text-xs mb-2 uppercase tracking-wider">Up Next</p>
                <div className="flex flex-col gap-2">
                  {workoutExercises.slice(currentIdx + 1).map((ex, i) => (
                    <div
                      key={ex.id}
                      className="p-3 rounded-xl flex items-center gap-3"
                      style={{ background: "#111113", border: "1px solid #27272A" }}
                    >
                      <span className="text-[#A1A1AA] text-xs w-5 text-center">{currentIdx + i + 2}</span>
                      <div className="flex-1">
                        <p className="text-[#A1A1AA] text-sm">{ex.name}</p>
                        <p className="text-[#52525B] text-xs">
                          {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.durationSec ? `${ex.durationSec}s` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.size > 0 && (
              <div>
                <p className="text-[#A1A1AA] text-xs mb-2 uppercase tracking-wider">Completed</p>
                {Array.from(completed).map(idx => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl flex items-center gap-3 mb-2"
                    style={{ background: "#0D0D0F", border: "1px solid #1C1C1E", opacity: 0.6 }}
                  >
                    <Check size={14} style={{ color: ACCENT }} />
                    <p className="text-[#71717A] text-sm">{workoutExercises[idx]?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}