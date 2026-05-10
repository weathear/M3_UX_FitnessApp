import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Timer, Check, CheckCircle2, Plus, Minus, Info, AlertCircle, Youtube } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { exercises, Workout, Exercise } from "../../data/mockData";
import { useNavigate } from "react-router"; // ÚJ IMPORT

const ACCENT = "#CCFF00";

interface Props {
  workout: Workout;
  onClose: () => void;
}

export function ActiveWorkoutView({ workout, onClose }: Props) {
  const { logWeight, getBestWeight, getLastWeight, addCompletedSession } = useApp();
  const navigate = useNavigate(); // ÚJ: Navigáció inicializálása

  const workoutExercises = workout.exerciseIds
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean) as typeof exercises;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [weightInputs, setWeightInputs] = useState<Record<number, string>>({});
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
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

  const handleWeightChange = (idx: number, val: string) => {
    const regex = /^[0-9]*\.?[0-9]{0,1}$/;
    if (val === "" || regex.test(val)) {
      setWeightInputs(p => ({ ...p, [idx]: val }));
    }
  };

  const adjustWeight = (idx: number, amount: number) => {
    const currentVal = parseFloat(weightInputs[idx] || "0");
    const newVal = Math.max(0, currentVal + amount);
    setWeightInputs(p => ({ ...p, [idx]: String(Math.round(newVal * 10) / 10) }));
  };

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

  // ÚJ: Eseménykezelő a befejezéshez
  const handleFinalFinish = () => {
    onClose(); // Bezárja az overlay-t
    navigate("/app/browse"); // Visszavisz a Browse fülre
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col transition-colors duration-300"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between shrink-0 border-b border-border">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted border border-border"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
        <div className="text-center">
          <p className="text-muted-foreground text-xs">Active Workout</p>
          <p className="text-foreground font-bold text-sm">{workout.name}</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-muted border border-border">
          <Timer size={12} style={{ color: ACCENT }} />
          <span className="text-foreground text-sm font-mono font-bold">{formatTime(seconds)}</span>
        </div>
      </div>

      {finished ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `3px solid ${ACCENT}` }}>
            <CheckCircle2 size={40} style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-bold">Workout Complete!</h2>
            <p className="text-muted-foreground text-sm mt-1">Great job crushing it today!</p>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-foreground font-bold text-xl">{formatTime(seconds)}</span>
              <span className="text-muted-foreground text-xs">Time</span>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-foreground font-bold text-xl">{workout.calories}</span>
              <span className="text-muted-foreground text-xs">kcal burned</span>
            </div>
          </div>
          {/* MÓDOSÍTOTT GOMB: onClose helyett handleFinalFinish */}
          <button 
            onClick={handleFinalFinish} 
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
              <span className="text-muted-foreground text-xs">Exercise {currentIdx + 1} of {workoutExercises.length}</span>
              <span className="text-xs" style={{ color: ACCENT }}>{completed.size} done</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: ACCENT }} animate={{ width: `${(currentIdx / workoutExercises.length) * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ scrollbarWidth: "none" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-2xl mb-4 bg-card border border-border relative overflow-hidden w-full mx-auto"
                style={{ background: `${ACCENT}05` }}
              >
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: ACCENT }}>{currentIdx + 1}</div>
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Current</span>
                    </div>
                    <button onClick={() => setShowDemo(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground border border-border"><Info size={14} /> Demo</button>
                </div>

                <h3 className="text-foreground text-xl font-bold mb-1 truncate">{current?.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {current?.sets && current?.reps ? `${current.sets} sets × ${current.reps} reps` : current?.durationSec ? `${current.durationSec} seconds` : ""}
                </p>

                {current?.isStrength && (
                  <div className="mb-4 w-full">
                    <p className="text-muted-foreground text-xs mb-2 font-medium">Weight used (kg)</p>
                    <div className="flex items-center justify-between gap-2 w-full max-w-full">
                      <button onClick={() => adjustWeight(currentIdx, -2.5)} className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted border border-border shrink-0 active:scale-95"><Minus size={20} className="text-muted-foreground" /></button>
                      <div className="flex-1 min-w-[80px]">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          value={weightInputs[currentIdx] || ""}
                          onChange={e => handleWeightChange(currentIdx, e.target.value.replace(',', '.'))}
                          placeholder="0"
                          className="w-full text-center rounded-xl py-3 bg-muted border border-border text-foreground font-bold text-2xl outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                      <button onClick={() => adjustWeight(currentIdx, 2.5)} className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted border border-border shrink-0 active:scale-95"><Plus size={20} style={{ color: ACCENT }} /></button>
                    </div>
                    {(bestWeight !== null || lastWeight !== null) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                        {lastWeight !== null && <p className="text-muted-foreground text-xs">Last: <span className="font-semibold">{lastWeight} kg</span></p>}
                        {bestWeight !== null && <p className="text-muted-foreground text-xs">Best: <span style={{ color: ACCENT }} className="font-bold">{bestWeight} kg</span></p>}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={markExerciseDone} className="w-full py-4 rounded-2xl font-semibold text-black flex items-center justify-center gap-2 mt-2" style={{ background: ACCENT }}>
                  <Check size={18} /> {currentIdx === workoutExercises.length - 1 ? "Finish Workout" : "Complete & Next"}
                </button>
              </motion.div>
            </AnimatePresence>

            {workoutExercises.slice(currentIdx + 1).length > 0 && (
              <div className="mb-4">
                <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wider">Up Next</p>
                <div className="flex flex-col gap-2">
                  {workoutExercises.slice(currentIdx + 1).map((ex, i) => (
                    <div key={ex.id} className="p-3 rounded-xl flex items-center gap-3 bg-card border border-border">
                      <span className="text-muted-foreground text-xs w-5 text-center">{currentIdx + i + 2}</span>
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">{ex.name}</p>
                        <p className="text-muted-foreground text-xs">{ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.durationSec ? `${ex.durationSec}s` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.size > 0 && (
              <div>
                <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wider">Completed</p>
                {Array.from(completed).map(idx => (
                  <div key={idx} className="p-3 rounded-xl flex items-center gap-3 mb-2 bg-muted border border-border opacity-60">
                    <Check size={14} style={{ color: ACCENT }} />
                    <p className="text-muted-foreground text-sm">{workoutExercises[idx]?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {showDemo && current && (
          <ExerciseDemoOverlay exercise={current} onClose={() => setShowDemo(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ExerciseDemoOverlay({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-end justify-center bg-black/90" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="w-full max-w-[430px] rounded-t-3xl overflow-hidden bg-card border-x border-t border-border flex flex-col" style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-2 shrink-0"><div className="w-10 h-1 rounded-full bg-muted" /></div>
        <div className="overflow-y-auto px-5 pb-10" style={{ scrollbarWidth: "none" }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-foreground text-xl font-bold">{exercise.name}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">{exercise.muscleGroups.map(m => (<span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{m}</span>))}</div>
            </div>
            <button onClick={onClose} className="p-1.5 text-muted-foreground"><X size={20} /></button>
          </div>
          <div className="p-4 rounded-2xl mb-6 bg-muted border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black" style={{ background: ACCENT }}>{exercise.expert.name[0]}</div>
              <div><p className="text-foreground text-sm font-semibold">{exercise.expert.name}</p><p className="text-muted-foreground text-xs">{exercise.expert.title}</p></div>
            </div>
            <p className="text-foreground text-xs italic leading-relaxed">"{exercise.expert.tip}"</p>
          </div>
          <div className="mb-6">
            <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2"><CheckCircle2 size={14} style={{ color: ACCENT }} /> Proper Form</h3>
            <div className="flex flex-col gap-2.5">{exercise.steps.map((step, i) => (<div key={i} className="flex gap-3 items-start"><div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: ACCENT, color: "#000" }}>{i + 1}</div><p className="text-muted-foreground text-sm leading-relaxed">{step}</p></div>))}</div>
          </div>
          <div className="mb-6">
            <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2"><AlertCircle size={14} className="text-destructive" /> Common Mistakes</h3>
            <div className="flex flex-col gap-2">{exercise.commonMistakes.map((m, i) => (<div key={i} className="flex gap-2 items-start"><X size={14} className="shrink-0 mt-0.5 text-destructive" /><p className="text-muted-foreground text-sm">{m}</p></div>))}</div>
          </div>
          {exercise.youtubeId && (
            <div>
              {showVideo ? (
                <div className="rounded-2xl overflow-hidden aspect-video"><iframe src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" /></div>
              ) : (
                <button onClick={() => setShowVideo(true)} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold bg-[#FF0000] text-white"><Youtube size={18} /> Watch Video Guide</button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}