import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, Clock, Dumbbell, Bell, Moon, LogOut, ChevronRight,
  Shield, Star, HelpCircle, Share2, Zap, Check, Trophy
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";

const ACCENT = "#CCFF00";

export function ProfilePage() {
  // ÚJ: A darkMode és setDarkMode a globális AppContext-ből jön!
  const { userProfile, completedSessions, setOnboarded, setUserProfile, darkMode, setDarkMode } = useApp();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handlePrivacyPolicy = () => {
    window.open("https://policies.google.com/privacy", "_blank");
  };

  const handleRateApp = () => {
    alert("Thank you for your support! 🌟 Taking you to the App Store...");
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "FitAI",
          text: "Check out this awesome fitness app!",
          url: "https://fitai.app"
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      alert("App link copied to your clipboard!");
    }
  };

  const handleSupport = () => {
    window.location.href = "mailto:support@fitai.app?subject=Help and Support";
  };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="w-11 h-6 rounded-full transition-all relative bg-muted"
      style={{ background: value ? ACCENT : undefined }}
    >
      <motion.div
        className="w-4.5 h-4.5 rounded-full absolute top-[3px] shadow-sm"
        style={{ width: 18, height: 18, background: value ? "#000" : "#fff" }}
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
    <div className="bg-background px-6 pt-12 pb-10 min-h-screen transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-muted-foreground text-sm">Your Account</p>
        <h1 className="text-foreground text-2xl font-bold mt-0.5">
          <span style={{ color: ACCENT }}>{displayName}</span>'s Profile
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl mb-5 relative overflow-hidden bg-card border border-border transition-colors duration-300"
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
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
            <h2 className="text-foreground text-lg font-bold">{displayName}</h2>
            <p className="text-muted-foreground text-xs capitalize">{levelLabel[userProfile.fitnessLevel]} · {goalLabel[userProfile.goal]}</p>
            <p className="text-muted-foreground text-xs">{userProfile.daysPerWeek || 3} days/week goal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
            <div
              className="h-full rounded-full"
              style={{ background: ACCENT, width: `${Math.min(100, (totalWorkouts / 50) * 100)}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs">{totalWorkouts}/50</span>
        </div>
        <p className="text-muted-foreground text-[10px] mt-1">workouts to next milestone</p>
      </motion.div>

      {/* All-time Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <h2 className="text-foreground text-base font-semibold mb-3 flex items-center gap-2">
          <Trophy size={15} style={{ color: ACCENT }} /> All-Time Stats
        </h2>
        <div className="flex flex-col gap-3">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              className="p-4 rounded-2xl flex items-center gap-4 bg-card border border-border transition-colors duration-300"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center opacity-90"
                style={{ background: `${item.color}20` }}
              >
                <item.icon size={17} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-foreground font-bold text-lg">{item.value}</p>
                  <p className="text-muted-foreground text-xs">{item.unit}</p>
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
        <h2 className="text-foreground text-base font-semibold mb-3">Settings</h2>
        <div className="rounded-2xl overflow-hidden bg-card border border-border transition-colors duration-300">
          
          {/* Notifications */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted">
              <Bell size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">Notifications</p>
              <p className="text-muted-foreground text-xs">Workout reminders & tips</p>
            </div>
            <ToggleSwitch value={notifications} onChange={() => setNotifications(n => !n)} />
          </div>

          {/* Dark mode */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted">
              <Moon size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">Dark Mode</p>
              <p className="text-muted-foreground text-xs">Toggle application theme</p>
            </div>
            {/* ÚJ: Itt hívjuk a globális setDarkMode-ot! */}
            <ToggleSwitch value={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>

          {/* Privacy */}
          <button 
            onClick={handlePrivacyPolicy}
            className="w-full text-left flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 border-b border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-muted">
              <Shield size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">Privacy Policy</p>
            </div>
            <ChevronRight size={13} className="text-muted-foreground" />
          </button>

          {/* Rate app */}
          <button 
            onClick={handleRateApp}
            className="w-full text-left flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 border-b border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-muted">
              <Star size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">Rate FitAI</p>
            </div>
            <ChevronRight size={13} className="text-muted-foreground" />
          </button>

          {/* Share */}
          <button 
            onClick={handleShareApp}
            className="w-full text-left flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 border-b border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-muted">
              <Share2 size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">Share FitAI</p>
            </div>
            <ChevronRight size={13} className="text-muted-foreground" />
          </button>

          {/* Help */}
          <button 
            onClick={handleSupport}
            className="w-full text-left flex items-center gap-3 p-4 transition-colors hover:bg-muted/50">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-muted">
              <HelpCircle size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium">Help & Support</p>
            </div>
            <ChevronRight size={13} className="text-muted-foreground" />
          </button>
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
        <span className="text-muted-foreground text-xs">FitAI v2.0.0</span>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-colors hover:bg-destructive/10 border border-border text-destructive"
      >
        <LogOut size={15} /> Sign Out
      </button>

      {/* ── Logout Confirmation Modal ────────────────────── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowLogoutConfirm(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 26 }}
              className="w-full max-w-[320px] rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl bg-card border border-border"
              onClick={e => e.stopPropagation()}>
              
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-destructive/10">
                <LogOut size={24} className="text-destructive" />
              </div>
              
              <h3 className="text-foreground text-lg font-bold mb-2">Sign Out?</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Are you sure you want to sign out? Your profile information will be reset.
              </p>
              
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all text-foreground border border-border">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all bg-destructive hover:bg-destructive/90">
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}