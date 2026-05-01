import { useState } from "react";
import { motion } from "motion/react";
import {
  Flame, Clock, Dumbbell, Bell, Moon, LogOut, ChevronRight,
  Shield, Star, HelpCircle, Share2, Zap, Check, Trophy
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";

const ACCENT = "#CCFF00";

export function ProfilePage() {
  const { userProfile, completedSessions, setOnboarded, setUserProfile } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const displayName = userProfile.name || "Athlete";
  const totalWorkouts = completedSessions.length;
  const totalCalories = completedSessions.reduce((a, s) => a + s.calories, 0);
  const totalMinutes = completedSessions.reduce((a, s) => a + s.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMin = totalMinutes % 60;

  const goalLabel: Record<string, string> = {
    "lose-weight": "Lose Weight",
    "build-muscle": "Build Muscle",
    "endurance": "Improve Endurance",
    "stay-active": "Stay Active",
    "": "Not set",
  };

  const levelLabel: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    "": "Not set",
  };

  const handleLogout = () => {
    setOnboarded(false);
    setUserProfile({ name: "", goal: "", fitnessLevel: "", daysPerWeek: 3 });
    navigate("/onboarding");
  };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="w-11 h-6 rounded-full transition-all relative"
      style={{ background: value ? ACCENT : "#27272A" }}
    >
      <motion.div
        className="w-4.5 h-4.5 rounded-full bg-white absolute top-[3px]"
        style={{ width: 18, height: 18 }}
        animate={{ left: value ? "calc(100% - 21px)" : "3px" }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </button>
  );

  const statItems = [
    { label: "Total Workouts", value: totalWorkouts, unit: "sessions", icon: Dumbbell, color: ACCENT },
    { label: "Calories Burned", value: totalCalories.toLocaleString(), unit: "kcal", icon: Flame, color: "#FF6B35" },
    {
      label: "Total Time",
      value: totalHours > 0 ? `${totalHours}h ${remainingMin}m` : `${totalMinutes}m`,
      unit: "trained",
      icon: Clock,
      color: "#3B82F6",
    },
  ];

  return (
    <div className="bg-[#09090B] px-6 pt-12 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-[#A1A1AA] text-sm">Your Account</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">
          <span style={{ color: ACCENT }}>{displayName}</span>'s Profile
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl mb-5 relative overflow-hidden"
        style={{ background: "#111113", border: "1px solid #27272A" }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-8 blur-2xl pointer-events-none"
          style={{ background: ACCENT }}
        />
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-black"
            style={{ background: ACCENT }}
          >
            {displayName[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">{displayName}</h2>
            <p className="text-[#A1A1AA] text-xs capitalize">{levelLabel[userProfile.fitnessLevel]} · {goalLabel[userProfile.goal]}</p>
            <p className="text-[#A1A1AA] text-xs">{userProfile.daysPerWeek || 3} days/week goal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ background: "#27272A" }}
          >
            <div
              className="h-full rounded-full"
              style={{ background: ACCENT, width: `${Math.min(100, (totalWorkouts / 50) * 100)}%` }}
            />
          </div>
          <span className="text-[#A1A1AA] text-xs">{totalWorkouts}/50</span>
        </div>
        <p className="text-[#A1A1AA] text-[10px] mt-1">workouts to next milestone</p>
      </motion.div>

      {/* All-time Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <h2 className="text-white text-base font-semibold mb-3 flex items-center gap-2">
          <Trophy size={15} style={{ color: ACCENT }} /> All-Time Stats
        </h2>
        <div className="flex flex-col gap-3">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              className="p-4 rounded-2xl flex items-center gap-4"
              style={{ background: "#111113", border: "1px solid #27272A" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${item.color}12` }}
              >
                <item.icon size={17} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="text-[#A1A1AA] text-xs">{item.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-white font-bold text-lg">{item.value}</p>
                  <p className="text-[#A1A1AA] text-xs">{item.unit}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-5"
      >
        <h2 className="text-white text-base font-semibold mb-3">Settings</h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#111113", border: "1px solid #27272A" }}
        >
          {/* Notifications */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid #1C1C1E" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#1C1C1E" }}>
              <Bell size={14} style={{ color: "#A1A1AA" }} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Notifications</p>
              <p className="text-[#A1A1AA] text-xs">Workout reminders & tips</p>
            </div>
            <ToggleSwitch value={notifications} onChange={() => setNotifications(n => !n)} />
          </div>

          {/* Dark mode */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid #1C1C1E" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#1C1C1E" }}>
              <Moon size={14} style={{ color: "#A1A1AA" }} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Dark Mode</p>
              <p className="text-[#A1A1AA] text-xs">Always on for best experience</p>
            </div>
            <ToggleSwitch value={darkMode} onChange={() => setDarkMode(d => !d)} />
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid #1C1C1E" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#1C1C1E" }}>
              <Shield size={14} style={{ color: "#A1A1AA" }} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Privacy Policy</p>
            </div>
            <ChevronRight size={13} style={{ color: "#71717A" }} />
          </div>

          {/* Rate app */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid #1C1C1E" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#1C1C1E" }}>
              <Star size={14} style={{ color: "#A1A1AA" }} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Rate FitAI</p>
            </div>
            <ChevronRight size={13} style={{ color: "#71717A" }} />
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid #1C1C1E" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#1C1C1E" }}>
              <Share2 size={14} style={{ color: "#A1A1AA" }} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Share FitAI</p>
            </div>
            <ChevronRight size={13} style={{ color: "#71717A" }} />
          </div>

          {/* Help */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#1C1C1E" }}>
              <HelpCircle size={14} style={{ color: "#A1A1AA" }} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Help & Support</p>
            </div>
            <ChevronRight size={13} style={{ color: "#71717A" }} />
          </div>
        </div>
      </motion.div>

      {/* App version */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: ACCENT }}
        >
          <Zap size={12} color="#000" fill="#000" />
        </div>
        <span className="text-[#71717A] text-xs">FitAI v1.0.0</span>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold"
        style={{ background: "transparent", border: "1px solid #27272A", color: "#EF4444" }}
      >
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  );
}