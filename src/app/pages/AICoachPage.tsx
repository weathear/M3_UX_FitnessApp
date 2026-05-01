import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send, Bot, Zap, ChevronRight, Check, RotateCcw,
  Dumbbell, Play, Bookmark, Calendar, Flame, Clock,
  Pencil, Trash2, Plus, X
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { fullDayNames, dayNames } from "../data/mockData";

const ACCENT = "#CCFF00";

// ─── Mock AI responses ───────────────────────────────────────────────────────

const expertAttribution = [
  { name: "Arnold Schwarzenegger", title: "7x Mr. Olympia Champion" },
  { name: "Rich Froning", title: "4x CrossFit Games Champion" },
  { name: "Ronnie Coleman", title: "8x Mr. Olympia Champion" },
  { name: "Simone Biles", title: "Olympic Gymnastics Champion" },
];

function getAIResponse(msg: string): { text: string; expert: { name: string; title: string } } {
  const lower = msg.toLowerCase();
  const expert = expertAttribution[Math.floor(Math.random() * expertAttribution.length)];

  if (lower.includes("protein") || lower.includes("nutrition") || lower.includes("diet") || lower.includes("eat")) {
    return {
      text: "For muscle building, aim for 1.6–2.2g of protein per kg of body weight daily. Prioritize whole food sources: chicken, eggs, fish, legumes. Time your protein intake around workouts — a serving 30–60 min post-workout accelerates recovery. Don't neglect carbohydrates — they're your training fuel. Keep fats moderate and focus on unsaturated sources like avocado and nuts.",
      expert,
    };
  }
  if (lower.includes("sleep") || lower.includes("recovery") || lower.includes("rest")) {
    return {
      text: "Sleep is when your muscles actually grow. Aim for 7–9 hours of quality sleep per night. During deep sleep, growth hormone peaks and protein synthesis is maximized. If you're training hard, don't underestimate active recovery — foam rolling, stretching, and low-intensity walks keep blood flowing without adding stress. A nap of 20–30 minutes can also boost afternoon training performance.",
      expert,
    };
  }
  if (lower.includes("weight loss") || lower.includes("fat") || lower.includes("lose") || lower.includes("cut")) {
    return {
      text: "Sustainable fat loss comes from a moderate caloric deficit (300–500 kcal/day) combined with strength training to preserve muscle. Don't slash calories drastically — you'll lose muscle and crash your metabolism. Prioritize protein, keep resistance training in your routine, and add cardio as a supplemental tool, not the primary driver. Track progress by photos and measurements, not just scale weight.",
      expert,
    };
  }
  if (lower.includes("beginner") || lower.includes("start") || lower.includes("new")) {
    return {
      text: "Welcome to the journey! Start with 3 full-body sessions per week using compound movements: squat, deadlift, bench press, overhead press, and rows. Master form before adding weight — a perfect light set is worth more than a sloppy heavy one. Consistency beats intensity at the start. You don't need fancy programs; you need to show up repeatedly. Expect noticeable strength gains in 4–8 weeks.",
      expert,
    };
  }
  if (lower.includes("muscle") || lower.includes("strength") || lower.includes("bulk") || lower.includes("gain")) {
    return {
      text: "Building muscle requires progressive overload — consistently adding more weight, reps, or sets over time. Train each muscle group 2x per week for optimal stimulus. Focus on compound movements (squat, deadlift, bench, rows) as your foundation, then add isolation work. A slight caloric surplus (200–300 kcal) with high protein intake creates the anabolic environment needed for growth. Track your lifts and aim to beat your previous session.",
      expert,
    };
  }
  if (lower.includes("cardio") || lower.includes("run") || lower.includes("endurance")) {
    return {
      text: "For endurance, build your aerobic base with Zone 2 training — a conversational pace where you could hold a sentence comfortably. Do this 3–4x per week. Add one high-intensity session (HIIT or tempo run) to improve lactate threshold. Don't neglect strength training — stronger legs mean more efficient running mechanics. Increase weekly mileage by no more than 10% per week to avoid injury.",
      expert,
    };
  }
  if (lower.includes("motivation") || lower.includes("give up") || lower.includes("unmotivated") || lower.includes("cheat")) {
    return {
      text: "Motivation is temporary; discipline is permanent. On the days you don't feel like training, lower the bar — commit to just showing up for 10 minutes. More often than not, you'll finish the full session. Build identity-based habits: stop saying 'I'm trying to work out' and start saying 'I'm an athlete.' Track small wins daily. Progress compounds — what feels impossible in week 1 becomes your warmup in month 6.",
      expert,
    };
  }
  return {
    text: "Great question! The foundation of any fitness goal is consistency, progressive overload, and adequate recovery. Whether your goal is fat loss, muscle gain, or improved endurance, training 3–5 days per week with purpose and supporting it with quality nutrition and sleep will produce results. What specific aspect would you like to dive deeper into — training, nutrition, recovery, or mindset?",
    expert,
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  expert?: { name: string; title: string };
  timestamp: Date;
}

interface GeneratedPlan {
  name: string;
  type: string;
  duration: number;
  exercises: { name: string; sets?: number; reps?: number; durationSec?: number; muscleGroups: string[] }[];
  totalCalories: number;
  totalTime: number;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AICoachPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "plan">("chat");

  return (
    <div className="bg-[#09090B] flex flex-col" style={{ height: "100%", minHeight: 0 }}>
      {/* Compact Header */}
      <div className="px-6 pt-8 pb-0">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
          >
            <Bot size={16} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-white text-base font-bold leading-tight">AI <span style={{ color: ACCENT }}>Coach</span></h1>
            <p className="text-[#A1A1AA] text-[10px]">Expert-backed guidance</p>
          </div>
        </div>

        {/* Compact Tabs */}
        <div className="flex gap-1.5 mb-0 p-1 rounded-xl" style={{ background: "#111113", border: "1px solid #27272A" }}>
          <button
            onClick={() => setActiveTab("chat")}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === "chat" ? ACCENT : "transparent",
              color: activeTab === "chat" ? "#000" : "#A1A1AA",
            }}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === "plan" ? ACCENT : "transparent",
              color: activeTab === "plan" ? "#000" : "#A1A1AA",
            }}
          >
            ⚡ Plan Generator
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
            style={{ minHeight: 0 }}
          >
            <ChatTab />
          </motion.div>
        ) : (
          <motion.div
            key="plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
            style={{ minHeight: 0 }}
          >
            <PlanGeneratorTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chat Tab ────────────────────────────────────────────────────────────────

function ChatTab() {
  const { userProfile } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: `Hey ${userProfile.name || "Athlete"}! I'm your AI coach, backed by methods from world-class athletes. Ask me anything about training, nutrition, recovery, or motivation. What's on your mind?`,
      expert: expertAttribution[0],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "How much protein do I need?",
    "Best exercises for beginners?",
    "How to stay motivated?",
    "How to build muscle fast?",
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const { text: responseText, expert } = getAIResponse(text);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      text: responseText,
      expert,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-3" style={{ scrollbarWidth: "none", minHeight: 0 }}>
        {/* Suggested questions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-[#A1A1AA] text-[10px] mb-2 uppercase tracking-widest">Quick questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{ background: "#1C1C1E", border: "1px solid #27272A", color: "#A1A1AA" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center mr-2 shrink-0 mt-1"
                style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
              >
                <Bot size={12} style={{ color: ACCENT }} />
              </div>
            )}
            <div style={{ maxWidth: "82%" }}>
              <div
                className="p-3.5 rounded-2xl"
                style={{
                  background: msg.role === "user" ? ACCENT : "#1C1C1E",
                  color: msg.role === "user" ? "#000" : "#fff",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  border: msg.role === "ai" ? "1px solid #27272A" : "none",
                }}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              {msg.role === "ai" && msg.expert && (
                <div className="flex items-center gap-1.5 mt-1.5 pl-1">
                  <div
                    className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold"
                    style={{ background: ACCENT, color: "#000" }}
                  >
                    {msg.expert.name[0]}
                  </div>
                  <p className="text-[10px] text-[#3F3F46]">
                    Based on methods by <span className="text-[#A1A1AA]">{msg.expert.name}</span>, {msg.expert.title}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center mr-2 shrink-0"
              style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
            >
              <Bot size={12} style={{ color: ACCENT }} />
            </div>
            <div className="p-3.5 rounded-2xl" style={{ background: "#1C1C1E", borderRadius: "18px 18px 18px 4px", border: "1px solid #27272A" }}>
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: ACCENT }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-4 pt-2" style={{ borderTop: "1px solid #1C1C1E" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about training, nutrition..."
            className="flex-1 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#3F3F46]"
            style={{
              background: "#1E1E1E",
              border: `1px solid ${input ? "#3F3F46" : "#27272A"}`,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0"
            style={{
              background: input.trim() ? ACCENT : "#1C1C1E",
              border: `1px solid ${input.trim() ? ACCENT : "#27272A"}`,
            }}
          >
            <Send size={15} style={{ color: input.trim() ? "#000" : "#71717A" }} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Plan Generator Tab ──────────────────────────────────────────────────────

const MUSCLE_GROUPS = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Quadriceps", "Hamstrings", "Glutes", "Calves",
  "Core", "Full Body",
];

const EQUIPMENT = ["No Equipment", "Dumbbells", "Barbell", "Machines", "Resistance Bands", "Pull-up Bar"];

const EXTRA_EXERCISES: Record<string, GeneratedPlan["exercises"]> = {
  strength: [
    { name: "Dumbbell Lunges", sets: 3, reps: 12, muscleGroups: ["Legs", "Glutes"] },
    { name: "Cable Rows", sets: 3, reps: 12, muscleGroups: ["Back"] },
    { name: "Face Pulls", sets: 3, reps: 15, muscleGroups: ["Shoulders"] },
    { name: "Leg Press", sets: 3, reps: 12, muscleGroups: ["Legs", "Glutes"] },
    { name: "Incline Dumbbell Press", sets: 3, reps: 10, muscleGroups: ["Chest"] },
  ],
  cardio: [
    { name: "Jump Rope", sets: 3, durationSec: 60, muscleGroups: ["Full Body"] },
    { name: "Sprint Intervals", sets: 5, durationSec: 30, muscleGroups: ["Legs"] },
    { name: "Lateral Shuffles", sets: 3, durationSec: 30, muscleGroups: ["Legs", "Core"] },
  ],
  stretching: [
    { name: "Pigeon Pose", sets: 2, durationSec: 45, muscleGroups: ["Hip Flexors", "Glutes"] },
    { name: "Thoracic Rotation", sets: 2, reps: 10, muscleGroups: ["Spine"] },
    { name: "Seated Forward Fold", sets: 2, durationSec: 40, muscleGroups: ["Hamstrings"] },
  ],
};

const REFINE_SUGGESTIONS = [
  "Make it harder",
  "Shorter session",
  "Add warm-up",
  "Bodyweight only",
  "Focus on core",
  "Add cool-down",
];

function generatePlan(prefs: {
  type: string;
  planType: string;
  duration: number;
  equipment: string[];
  muscleGroups: string[];
  intensity: string;
}): GeneratedPlan {
  const exerciseSets: Record<string, { name: string; sets?: number; reps?: number; durationSec?: number; muscleGroups: string[] }[]> = {
    strength: [
      { name: "Barbell Bench Press", sets: 4, reps: 10, muscleGroups: ["Chest", "Triceps"] },
      { name: "Barbell Back Squat", sets: 4, reps: 8, muscleGroups: ["Legs", "Glutes"] },
      { name: "Conventional Deadlift", sets: 3, reps: 6, muscleGroups: ["Back", "Hamstrings"] },
      { name: "Pull-Up", sets: 3, reps: 8, muscleGroups: ["Back", "Biceps"] },
      { name: "Overhead Press", sets: 4, reps: 10, muscleGroups: ["Shoulders", "Triceps"] },
      { name: "Dumbbell Bicep Curl", sets: 3, reps: 12, muscleGroups: ["Biceps"] },
      { name: "Tricep Dips", sets: 3, reps: 12, muscleGroups: ["Triceps"] },
      { name: "Romanian Deadlift", sets: 3, reps: 12, muscleGroups: ["Hamstrings", "Glutes"] },
    ],
    cardio: [
      { name: "Burpees", sets: 3, reps: 15, muscleGroups: ["Full Body"] },
      { name: "Mountain Climbers", sets: 3, durationSec: 45, muscleGroups: ["Core", "Shoulders"] },
      { name: "Jumping Jacks", sets: 3, durationSec: 60, muscleGroups: ["Full Body"] },
      { name: "Box Jumps", sets: 4, reps: 8, muscleGroups: ["Legs", "Glutes"] },
      { name: "High Knees", sets: 3, durationSec: 45, muscleGroups: ["Core", "Legs"] },
    ],
    stretching: [
      { name: "Hip Flexor Stretch", sets: 2, durationSec: 45, muscleGroups: ["Hip Flexors"] },
      { name: "Plank Hold", sets: 3, durationSec: 60, muscleGroups: ["Core"] },
      { name: "Hamstring Stretch", sets: 2, durationSec: 40, muscleGroups: ["Hamstrings"] },
      { name: "Shoulder Stretch", sets: 2, durationSec: 30, muscleGroups: ["Shoulders"] },
      { name: "Cat-Cow Stretch", sets: 3, reps: 10, muscleGroups: ["Spine", "Core"] },
    ],
  };

  const pool = exerciseSets[prefs.type as keyof typeof exerciseSets] || exerciseSets.strength;
  const count = prefs.duration <= 20 ? 3 : prefs.duration <= 40 ? 5 : 7;
  const selected = pool.slice(0, count);

  const intensityMult = prefs.intensity === "low" ? 0.7 : prefs.intensity === "high" ? 1.3 : 1;
  const calories = Math.round(prefs.duration * (prefs.type === "cardio" ? 10 : 7) * intensityMult);

  const typeLabel: Record<string, string> = {
    single: "Single Session",
    weekly: "7-Day Weekly Plan",
    monthly: "4-Week Monthly Plan",
  };

  return {
    name: `AI-Generated ${prefs.type.charAt(0).toUpperCase() + prefs.type.slice(1)} ${typeLabel[prefs.planType] || "Workout"}`,
    type: typeLabel[prefs.planType] || "Workout",
    duration: prefs.duration,
    exercises: selected,
    totalCalories: calories,
    totalTime: prefs.duration,
  };
}

function PlanGeneratorTab() {
  const { saveTemplate, addToSchedule } = useApp();
  const [step, setStep] = useState(0);
  const [type, setType] = useState("strength");
  const [planType, setPlanType] = useState("single");
  const [duration, setDuration] = useState(45);
  const [equipment, setEquipment] = useState<string[]>(["Barbell"]);
  const [muscles, setMuscles] = useState<string[]>(["Chest", "Back"]);
  const [intensity, setIntensity] = useState("medium");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scheduleDay, setScheduleDay] = useState<number | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedExercises, setEditedExercises] = useState<GeneratedPlan["exercises"]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState("3");
  const [newExReps, setNewExReps] = useState("10");
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [refinements, setRefinements] = useState<{ prompt: string; message: string }[]>([]);
  const refineEndRef = useRef<HTMLDivElement>(null);

  const totalSteps = type === "strength" ? 5 : 4;

  const generate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    const plan = generatePlan({ type, planType, duration, equipment, muscleGroups: muscles, intensity });
    setGeneratedPlan(plan);
    setGenerating(false);
  };

  const reset = () => {
    setStep(0);
    setGeneratedPlan(null);
    setSaved(false);
    setScheduleDay(null);
    setShowEditModal(false);
    setRefinements([]);
    setRefineInput("");
  };

  const openEdit = () => {
    if (!generatedPlan) return;
    setEditedExercises(generatedPlan.exercises.map(e => ({ ...e })));
    setShowAddForm(false);
    setNewExName("");
    setNewExSets("3");
    setNewExReps("10");
    setShowEditModal(true);
  };

  const saveEdits = () => {
    if (!generatedPlan) return;
    setGeneratedPlan({ ...generatedPlan, exercises: editedExercises });
    setShowEditModal(false);
  };

  const updateEx = (i: number, field: string, value: string) => {
    setEditedExercises(prev => prev.map((ex, idx) =>
      idx === i ? { ...ex, [field]: field === "name" ? value : Number(value) || undefined } : ex
    ));
  };

  const deleteEx = (i: number) => {
    setEditedExercises(prev => prev.filter((_, idx) => idx !== i));
  };

  const addEx = () => {
    if (!newExName.trim()) return;
    setEditedExercises(prev => [
      ...prev,
      { name: newExName.trim(), sets: Number(newExSets) || 3, reps: Number(newExReps) || 10, muscleGroups: [] },
    ]);
    setNewExName("");
    setNewExSets("3");
    setNewExReps("10");
    setShowAddForm(false);
  };

  const refinePrompt = async (prompt: string) => {
    if (!generatedPlan || !prompt.trim() || refining) return;
    setRefining(true);
    setRefineInput("");
    await new Promise(r => setTimeout(r, 1400 + Math.random() * 600));

    const lower = prompt.toLowerCase();
    let updated = { ...generatedPlan, exercises: generatedPlan.exercises.map(e => ({ ...e })) };
    let message = "";

    if (lower.includes("harder") || lower.includes("intense") || lower.includes("difficult") || lower.includes("increase")) {
      updated.exercises = updated.exercises.map(ex => ({
        ...ex,
        sets: Math.min((ex.sets || 3) + 1, 6),
        reps: ex.reps ? Math.min(ex.reps + 2, 20) : ex.reps,
        durationSec: ex.durationSec ? Math.min(ex.durationSec + 15, 120) : ex.durationSec,
      }));
      updated.totalCalories = Math.round(updated.totalCalories * 1.2);
      message = "Boosted sets & reps across all exercises for a higher intensity session.";
    } else if (lower.includes("easier") || lower.includes("lighter") || lower.includes("beginner") || lower.includes("reduce")) {
      updated.exercises = updated.exercises.map(ex => ({
        ...ex,
        sets: Math.max((ex.sets || 3) - 1, 1),
        reps: ex.reps ? Math.max(ex.reps - 2, 5) : ex.reps,
        durationSec: ex.durationSec ? Math.max(ex.durationSec - 10, 20) : ex.durationSec,
      }));
      updated.totalCalories = Math.round(updated.totalCalories * 0.8);
      message = "Reduced sets & reps for a more manageable session.";
    } else if (lower.includes("shorter") || lower.includes("quick") || lower.includes("fewer")) {
      if (updated.exercises.length > 2) {
        updated.exercises = updated.exercises.slice(0, -1);
        message = `Trimmed to ${updated.exercises.length} exercises for a shorter session.`;
      } else {
        message = "Already at the minimum — 2 exercises remain.";
      }
    } else if (lower.includes("longer") || lower.includes("more exercise") || lower.includes("add more") || lower.includes("extra")) {
      const pool = EXTRA_EXERCISES[type as keyof typeof EXTRA_EXERCISES] || EXTRA_EXERCISES.strength;
      const existing = updated.exercises.map(e => e.name);
      const newEx = pool.find(e => !existing.includes(e.name));
      if (newEx) {
        updated.exercises = [...updated.exercises, newEx];
        message = `Added "${newEx.name}" to extend your session.`;
      } else {
        message = "All available exercises are already in the plan.";
      }
    } else if (lower.includes("warm up") || lower.includes("warmup")) {
      const warmupNames = ["Light Jog / March", "Dynamic Arm Circles"];
      if (!updated.exercises.some(e => warmupNames.includes(e.name))) {
        updated.exercises = [
          { name: "Light Jog / March", sets: 1, durationSec: 180, muscleGroups: ["Full Body"] },
          { name: "Dynamic Arm Circles", sets: 1, reps: 15, muscleGroups: ["Shoulders"] },
          ...updated.exercises,
        ];
        message = "Added a warm-up block at the beginning.";
      } else {
        message = "Warm-up block is already included.";
      }
    } else if (lower.includes("cool down") || lower.includes("cooldown")) {
      const cooldownNames = ["Standing Quad Stretch", "Child's Pose"];
      if (!updated.exercises.some(e => cooldownNames.includes(e.name))) {
        updated.exercises = [
          ...updated.exercises,
          { name: "Standing Quad Stretch", sets: 1, durationSec: 40, muscleGroups: ["Quadriceps"] },
          { name: "Child's Pose", sets: 1, durationSec: 60, muscleGroups: ["Core", "Back"] },
        ];
        message = "Added a cool-down block at the end.";
      } else {
        message = "Cool-down block is already included.";
      }
    } else if (lower.includes("no equipment") || lower.includes("bodyweight") || lower.includes("home")) {
      const bw: GeneratedPlan["exercises"] = [
        { name: "Push-Ups", sets: 3, reps: 15, muscleGroups: ["Chest", "Triceps"] },
        { name: "Bodyweight Squats", sets: 3, reps: 20, muscleGroups: ["Legs", "Glutes"] },
        { name: "Plank", sets: 3, durationSec: 45, muscleGroups: ["Core"] },
        { name: "Mountain Climbers", sets: 3, durationSec: 30, muscleGroups: ["Core", "Shoulders"] },
        { name: "Glute Bridges", sets: 3, reps: 15, muscleGroups: ["Glutes", "Hamstrings"] },
        { name: "Tricep Dips (Chair)", sets: 3, reps: 12, muscleGroups: ["Triceps"] },
        { name: "Superman Hold", sets: 3, durationSec: 30, muscleGroups: ["Back", "Glutes"] },
      ];
      updated.exercises = bw.slice(0, updated.exercises.length);
      message = "Swapped to bodyweight-only exercises — no equipment needed.";
    } else {
      const muscleMap: Record<string, { name: string; sets: number; reps: number; muscleGroups: string[] }> = {
        chest: { name: "Incline Dumbbell Press", sets: 4, reps: 10, muscleGroups: ["Chest"] },
        back: { name: "Barbell Row", sets: 4, reps: 10, muscleGroups: ["Back"] },
        legs: { name: "Bulgarian Split Squat", sets: 3, reps: 10, muscleGroups: ["Legs", "Glutes"] },
        shoulders: { name: "Arnold Press", sets: 3, reps: 12, muscleGroups: ["Shoulders"] },
        arms: { name: "Hammer Curl", sets: 3, reps: 12, muscleGroups: ["Biceps"] },
        core: { name: "Cable Crunch", sets: 3, reps: 15, muscleGroups: ["Core"] },
        glutes: { name: "Hip Thrust", sets: 4, reps: 12, muscleGroups: ["Glutes"] },
        biceps: { name: "Preacher Curl", sets: 3, reps: 12, muscleGroups: ["Biceps"] },
        triceps: { name: "Skull Crushers", sets: 3, reps: 12, muscleGroups: ["Triceps"] },
      };
      const matchedMuscle = Object.keys(muscleMap).find(m => lower.includes(m));
      if (matchedMuscle) {
        const newEx = muscleMap[matchedMuscle];
        if (!updated.exercises.some(e => e.name === newEx.name)) {
          updated.exercises = [...updated.exercises, newEx];
          message = `Added "${newEx.name}" to target your ${matchedMuscle}.`;
        } else {
          message = `Your ${matchedMuscle} is already well-targeted in this plan.`;
        }
      } else {
        updated.exercises = updated.exercises.map(ex => ({
          ...ex,
          reps: ex.reps ? Math.max(ex.reps + (Math.random() > 0.5 ? 1 : -1), 5) : ex.reps,
        }));
        message = "Applied minor refinements based on your request.";
      }
    }

    setGeneratedPlan(updated);
    setRefinements(prev => [...prev, { prompt: prompt.trim(), message }]);
    setRefining(false);
  };

  useEffect(() => {
    refineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [refinements, refining]);

  const toggleEquipment = (e: string) =>
    setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  const toggleMuscle = (m: string) =>
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const nextStep = () => {
    if (step < totalSteps - 1) setStep(s => s + 1);
    else generate();
  };

  if (generatedPlan) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-8" style={{ scrollbarWidth: "none" }}>
        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center"
              style={{ background: "rgba(0,0,0,0.85)" }}
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="w-full max-w-[430px] rounded-t-3xl flex flex-col"
                style={{ background: "#111113", border: "1px solid #27272A", maxHeight: "88vh" }}
                onClick={e => e.stopPropagation()}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-[#3F3F46]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: "1px solid #27272A" }}>
                  <h3 className="text-white font-bold text-base">Edit Workout</h3>
                  <button onClick={() => setShowEditModal(false)} className="p-1.5">
                    <X size={18} style={{ color: "#A1A1AA" }} />
                  </button>
                </div>

                {/* Exercise list */}
                <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>
                  <div className="flex flex-col gap-3">
                    {editedExercises.map((ex, i) => (
                      <div key={i} className="p-3.5 rounded-2xl" style={{ background: "#1C1C1E", border: "1px solid #27272A" }}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-black shrink-0"
                            style={{ background: ACCENT }}
                          >
                            {i + 1}
                          </div>
                          <input
                            value={ex.name}
                            onChange={e => updateEx(i, "name", e.target.value)}
                            className="flex-1 bg-transparent text-white text-sm font-semibold outline-none border-b border-[#3F3F46] pb-0.5 focus:border-[#CCFF00] transition-colors"
                            placeholder="Exercise name"
                          />
                          <button onClick={() => deleteEx(i)} className="p-1 shrink-0">
                            <Trash2 size={14} style={{ color: "#EF4444" }} />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 flex flex-col gap-1">
                            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Sets</span>
                            <input
                              type="number"
                              value={ex.sets ?? ""}
                              onChange={e => updateEx(i, "sets", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg text-white text-xs text-center outline-none"
                              style={{ background: "#09090B", border: "1px solid #3F3F46" }}
                              min={1}
                            />
                          </div>
                          {ex.durationSec !== undefined ? (
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Duration (s)</span>
                              <input
                                type="number"
                                value={ex.durationSec ?? ""}
                                onChange={e => updateEx(i, "durationSec", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-white text-xs text-center outline-none"
                                style={{ background: "#09090B", border: "1px solid #3F3F46" }}
                                min={1}
                              />
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Reps</span>
                              <input
                                type="number"
                                value={ex.reps ?? ""}
                                onChange={e => updateEx(i, "reps", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-white text-xs text-center outline-none"
                                style={{ background: "#09090B", border: "1px solid #3F3F46" }}
                                min={1}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add exercise form */}
                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="p-3.5 rounded-2xl" style={{ background: `${ACCENT}0D`, border: `1px solid ${ACCENT}30` }}>
                          <p className="text-xs font-semibold mb-2.5" style={{ color: ACCENT }}>New Exercise</p>
                          <input
                            value={newExName}
                            onChange={e => setNewExName(e.target.value)}
                            placeholder="Exercise name"
                            className="w-full px-3 py-2 rounded-xl text-white text-sm outline-none mb-2 placeholder:text-[#3F3F46]"
                            style={{ background: "#09090B", border: "1px solid #3F3F46" }}
                          />
                          <div className="flex gap-2 mb-2.5">
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Sets</span>
                              <input
                                type="number"
                                value={newExSets}
                                onChange={e => setNewExSets(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-white text-xs text-center outline-none"
                                style={{ background: "#09090B", border: "1px solid #3F3F46" }}
                                min={1}
                              />
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Reps</span>
                              <input
                                type="number"
                                value={newExReps}
                                onChange={e => setNewExReps(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg text-white text-xs text-center outline-none"
                                style={{ background: "#09090B", border: "1px solid #3F3F46" }}
                                min={1}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowAddForm(false)}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold"
                              style={{ background: "transparent", color: "#A1A1AA", border: "1px solid #27272A" }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={addEx}
                              disabled={!newExName.trim()}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold text-black"
                              style={{ background: newExName.trim() ? ACCENT : "#3F3F46" }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!showAddForm && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: "transparent", color: "#A1A1AA", border: "1px dashed #3F3F46" }}
                    >
                      <Plus size={13} /> Add Exercise
                    </button>
                  )}
                </div>

                {/* Save button */}
                <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid #27272A" }}>
                  <button
                    onClick={saveEdits}
                    className="w-full py-3.5 rounded-2xl font-semibold text-black flex items-center justify-center gap-2"
                    style={{ background: ACCENT }}
                  >
                    <Check size={16} /> Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-lg">Your Plan is Ready!</h3>
            <p className="text-[#A1A1AA] text-xs">AI-generated & expert-backed</p>
          </div>
          <button onClick={reset} className="p-2 rounded-xl" style={{ background: "#1C1C1E", border: "1px solid #27272A" }}>
            <RotateCcw size={14} style={{ color: "#A1A1AA" }} />
          </button>
        </div>

        <div className="p-4 rounded-2xl mb-4" style={{ background: `${ACCENT}0D`, border: `1px solid ${ACCENT}25` }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
            style={{ background: ACCENT }}
          >
            <Zap size={16} color="#000" fill="#000" />
          </div>
          <h4 className="text-white font-bold text-base mb-0.5">{generatedPlan.name}</h4>
          <p className="text-[#71717A] text-xs mb-3">{generatedPlan.type}</p>
          <div className="flex gap-4">
            <span className="text-xs flex items-center gap-1.5 text-[#A1A1AA]">
              <Clock size={11} strokeWidth={1.5} />{generatedPlan.totalTime}<span className="text-[#A1A1AA] text-[10px]">min</span>
            </span>
            <span className="text-xs flex items-center gap-1.5 text-[#A1A1AA]">
              <Flame size={11} strokeWidth={1.5} />{generatedPlan.totalCalories}<span className="text-[#A1A1AA] text-[10px]">kcal</span>
            </span>
            <span className="text-xs flex items-center gap-1.5 text-[#A1A1AA]">
              <Dumbbell size={11} strokeWidth={1.5} />{generatedPlan.exercises.length} exercises
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold text-sm">Exercises</h4>
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}35` }}
          >
            <Pencil size={11} /> Edit
          </button>
        </div>
        <div className="flex flex-col gap-2 mb-5">
          {generatedPlan.exercises.map((ex, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl flex items-center gap-3"
              style={{ background: "#111113", border: "1px solid #27272A" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black shrink-0" style={{ background: ACCENT }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{ex.name}</p>
                <p className="text-[#71717A] text-xs">
                  {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps} reps` : ex.durationSec ? `${ex.sets}× ${ex.durationSec}s` : ""}
                  {" · "}{ex.muscleGroups.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Refine with AI ──────────────────────────────────── */}
        <div className="mb-5 rounded-2xl overflow-hidden" style={{ border: "1px solid #27272A", background: "#111113" }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid #1C1C1E" }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${ACCENT}18` }}>
              <Zap size={11} style={{ color: ACCENT }} />
            </div>
            <span className="text-white text-xs font-semibold">Refine with AI</span>
            <span className="text-[#3F3F46] text-[10px] ml-auto">describe changes in plain text</span>
          </div>

          {/* Refinement history */}
          {refinements.length > 0 && (
            <div className="px-4 pt-3 pb-1 flex flex-col gap-2.5 max-h-52 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {refinements.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-end mb-1">
                    <div
                      className="px-3 py-2 rounded-2xl text-xs max-w-[75%]"
                      style={{ background: ACCENT, color: "#000", borderRadius: "14px 14px 3px 14px" }}
                    >
                      {r.prompt}
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}>
                      <Bot size={10} style={{ color: ACCENT }} />
                    </div>
                    <div
                      className="px-3 py-2 rounded-2xl text-xs flex-1"
                      style={{ background: "#1C1C1E", color: "#E4E4E7", border: "1px solid #27272A", borderRadius: "3px 14px 14px 14px" }}
                    >
                      {r.message}
                    </div>
                  </div>
                </div>
              ))}
              {refining && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}>
                    <Bot size={10} style={{ color: ACCENT }} />
                  </div>
                  <div className="px-3 py-2 rounded-2xl" style={{ background: "#1C1C1E", border: "1px solid #27272A", borderRadius: "3px 14px 14px 14px" }}>
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={refineEndRef} />
            </div>
          )}

          {/* Suggestion chips — shown only before first refinement */}
          {refinements.length === 0 && !refining && (
            <div className="px-4 pt-3 flex gap-2 flex-wrap">
              {REFINE_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => refinePrompt(s)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] transition-all"
                  style={{ background: "#1C1C1E", border: "1px solid #27272A", color: "#A1A1AA" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2 p-3">
            <input
              value={refineInput}
              onChange={e => setRefineInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && refinePrompt(refineInput)}
              placeholder="e.g. make it shorter, add core work…"
              disabled={refining}
              className="flex-1 rounded-xl px-3 py-2.5 text-white text-xs outline-none placeholder:text-[#3F3F46] transition-colors"
              style={{ background: "#1C1C1E", border: `1px solid ${refineInput ? "#3F3F46" : "#27272A"}` }}
            />
            <button
              onClick={() => refinePrompt(refineInput)}
              disabled={!refineInput.trim() || refining}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
              style={{
                background: refineInput.trim() && !refining ? ACCENT : "#1C1C1E",
                border: `1px solid ${refineInput.trim() && !refining ? ACCENT : "#27272A"}`,
              }}
            >
              <Send size={13} style={{ color: refineInput.trim() && !refining ? "#000" : "#71717A" }} />
            </button>
          </div>
        </div>
        {/* ─────────────────────────────────────────────────────── */}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setSaved(true); }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
            style={{
              background: "transparent",
              color: saved ? ACCENT : "#A1A1AA",
              border: `1px solid ${saved ? ACCENT : "#27272A"}`,
            }}
          >
            {saved ? <><Check size={14} /> Saved!</> : <><Bookmark size={14} /> Save Plan</>}
          </button>
          <button
            onClick={() => setShowSchedule(true)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 text-black"
            style={{ background: ACCENT }}
          >
            <Calendar size={14} /> Schedule
          </button>
        </div>

        {/* Schedule picker */}
        <AnimatePresence>
          {showSchedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[#A1A1AA] text-xs mb-2">Select day:</p>
              <div className="flex flex-col gap-3 mb-3" style={{ maxHeight: 260, overflowY: "auto" }}>
                {[0, 1, 2, 3, 4].map(w => {
                  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                  const wkMonday = new Date();
                  wkMonday.setDate(wkMonday.getDate() - todayIdx);
                  wkMonday.setHours(0, 0, 0, 0);
                  const maxIdx = todayIdx + 30;
                  const getDayDate = (abs: number) => new Date(wkMonday.getTime() + abs * 86400000).getDate();
                  const getDayMon = (abs: number) =>
                    new Date(wkMonday.getTime() + abs * 86400000).toLocaleDateString("en-US", { month: "short" });
                  const weekStart = w * 7;
                  const weekEnd = w * 7 + 6;
                  if (weekEnd < todayIdx || weekStart > maxIdx) return null;
                  const weekLabel = w === 0 ? "This Week" : w === 1 ? "Next Week"
                    : `${getDayMon(weekStart)} ${getDayDate(weekStart)}–${getDayDate(weekEnd)}`;
                  return (
                    <div key={w}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: ACCENT }}>
                        {weekLabel}
                      </p>
                      <div className="grid grid-cols-7 gap-1">
                        {dayNames.map((_, j) => {
                          const i = w * 7 + j;
                          const isPast = i < todayIdx;
                          const isBeyond = i > maxIdx;
                          const disabled = isPast || isBeyond;
                          const isToday = i === todayIdx;
                          return (
                            <button
                              key={i}
                              disabled={disabled}
                              onClick={() => !disabled && setScheduleDay(i)}
                              className="py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all"
                              style={{
                                background: scheduleDay === i ? `${ACCENT}15` : disabled ? "#0D0D0F" : "#1C1C1E",
                                border: `1px solid ${scheduleDay === i ? ACCENT : disabled ? "#1C1C1E" : "#27272A"}`,
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.28 : 1,
                              }}
                            >
                              <span className="text-[9px]" style={{ color: disabled ? "#3F3F46" : "#A1A1AA" }}>{dayNames[j]}</span>
                              <span className="text-[10px] font-semibold" style={{ color: disabled ? "#3F3F46" : isToday ? ACCENT : "#fff" }}>{getDayDate(i)}</span>
                              {isToday && <span className="text-[7px]" style={{ color: ACCENT }}>Today</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {scheduleDay !== null && (() => {
                const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                const wkMonday = new Date();
                wkMonday.setDate(wkMonday.getDate() - todayIdx);
                wkMonday.setHours(0, 0, 0, 0);
                const d = new Date(wkMonday.getTime() + scheduleDay * 86400000);
                const lbl = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                return (
                  <button
                    onClick={() => {
                      addToSchedule("w1", scheduleDay);
                      setShowSchedule(false);
                      setScheduleDay(null);
                    }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-black"
                    style={{ background: ACCENT }}
                  >
                    Add to {lbl}
                  </button>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: `${ACCENT}12`, border: `2px solid ${ACCENT}35` }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap size={36} style={{ color: ACCENT }} />
          </motion.div>
        </div>
        <div>
          <h3 className="text-white text-xl font-bold">Building Your Plan</h3>
          <p className="text-[#A1A1AA] text-sm mt-1">AI is analyzing your preferences...</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: ACCENT }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "none" }}>
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= step ? ACCENT : "#27272A" }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Workout type */}
          {step === 0 && (
            <div>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: ACCENT }}>Step 1</p>
              <h3 className="text-white text-xl font-bold mb-1">Workout Type</h3>
              <p className="text-[#A1A1AA] text-sm mb-5">What kind of training?</p>
              <div className="flex flex-col gap-3">
                {[
                  { id: "strength", label: "💪 Strength Training", desc: "Build muscle and increase power" },
                  { id: "cardio", label: "🏃 Cardio", desc: "Improve endurance and burn fat" },
                  { id: "stretching", label: "🧘 Stretching / Mobility", desc: "Flexibility and recovery" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setType(opt.id)}
                    className="p-4 rounded-2xl border text-left transition-all"
                    style={{
                      background: type === opt.id ? `${ACCENT}12` : "#111113",
                      borderColor: type === opt.id ? ACCENT : "#27272A",
                    }}
                  >
                    <p className="text-white font-semibold text-sm">{opt.label}</p>
                    <p className="text-[#A1A1AA] text-xs mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Plan type */}
          {step === 1 && (
            <div>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: ACCENT }}>Step 2</p>
              <h3 className="text-white text-xl font-bold mb-1">Plan Duration</h3>
              <p className="text-[#A1A1AA] text-sm mb-5">Single session or multi-week?</p>
              <div className="flex flex-col gap-3">
                {[
                  { id: "single", label: "Single Workout", desc: "One focused training session" },
                  { id: "weekly", label: "7-Day Plan", desc: "A full week of structured training" },
                  { id: "monthly", label: "4-Week Plan", desc: "Monthly progressive program" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPlanType(opt.id)}
                    className="p-4 rounded-2xl border text-left transition-all"
                    style={{
                      background: planType === opt.id ? `${ACCENT}12` : "#111113",
                      borderColor: planType === opt.id ? ACCENT : "#27272A",
                    }}
                  >
                    <p className="text-white font-semibold text-sm">{opt.label}</p>
                    <p className="text-[#A1A1AA] text-xs mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: ACCENT }}>Step 3</p>
              <h3 className="text-white text-xl font-bold mb-1">Session Duration</h3>
              <p className="text-[#A1A1AA] text-sm mb-5">How long per session?</p>
              <div className="flex flex-col gap-2">
                {[15, 30, 45, 60, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className="p-4 rounded-2xl border flex items-center justify-between transition-all"
                    style={{
                      background: duration === d ? `${ACCENT}12` : "#111113",
                      borderColor: duration === d ? ACCENT : "#27272A",
                    }}
                  >
                    <span className="text-white font-semibold text-sm">{d} minutes</span>
                    {duration === d && <Check size={14} style={{ color: ACCENT }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Equipment (strength only) */}
          {step === 3 && type === "strength" && (
            <div>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: ACCENT }}>Step 4</p>
              <h3 className="text-white text-xl font-bold mb-1">Equipment</h3>
              <p className="text-[#A1A1AA] text-sm mb-5">What do you have access to?</p>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.map(e => (
                  <button
                    key={e}
                    onClick={() => toggleEquipment(e)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: equipment.includes(e) ? `${ACCENT}15` : "#111113",
                      borderColor: equipment.includes(e) ? ACCENT : "#27272A",
                      border: "1px solid",
                      color: equipment.includes(e) ? ACCENT : "#A1A1AA",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 (cardio/stretching) or 4 (strength): Intensity */}
          {((step === 3 && type !== "strength") || (step === 4 && type === "strength")) && (
            <div>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: ACCENT }}>
                Step {type === "strength" ? 5 : 4}
              </p>
              <h3 className="text-white text-xl font-bold mb-1">Intensity</h3>
              <p className="text-[#A1A1AA] text-sm mb-5">How hard do you want to push?</p>
              <div className="flex flex-col gap-3">
                {[
                  { id: "low", label: "🌱 Low", desc: "Light effort, recovery-focused" },
                  { id: "medium", label: "🔥 Medium", desc: "Moderate challenge, steady progress" },
                  { id: "high", label: "⚡ High", desc: "Maximum intensity, advanced" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setIntensity(opt.id)}
                    className="p-4 rounded-2xl border text-left transition-all"
                    style={{
                      background: intensity === opt.id ? `${ACCENT}12` : "#111113",
                      borderColor: intensity === opt.id ? ACCENT : "#27272A",
                    }}
                  >
                    <p className="text-white font-semibold text-sm">{opt.label}</p>
                    <p className="text-[#A1A1AA] text-xs mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2 mt-6">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-all"
            style={{ background: "transparent", color: "#A1A1AA", border: "1px solid #27272A" }}
          >
            Back
          </button>
        )}
        <button
          onClick={nextStep}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 text-black"
          style={{ background: ACCENT }}
        >
          {step === totalSteps - 1 ? "Generate Plan ⚡" : <>Next <ChevronRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}