import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { workouts as allWorkouts } from "../data/mockData";

export interface UserProfile {
  name: string;
  goal: string;
  fitnessLevel: string;
  daysPerWeek: number;
}

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  dayIndex: number;
  completed: boolean;
}

export interface CompletedSession {
  workoutId: string;
  date: string;
  calories: number;
  duration: number;
}

export interface WeightEntry {
  exerciseId: string;
  weight: number;
  date: string;
}

interface AppContextType {
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (p: UserProfile) => void;
  schedule: ScheduledWorkout[];
  addToSchedule: (workoutId: string, dayIndex: number) => void;
  removeFromSchedule: (id: string) => void;
  markComplete: (id: string) => void;
  savedTemplates: string[];
  saveTemplate: (workoutId: string) => void;
  removeTemplate: (workoutId: string) => void;
  completedSessions: CompletedSession[];
  addCompletedSession: (session: CompletedSession) => void;
  weightLog: WeightEntry[];
  logWeight: (exerciseId: string, weight: number) => void;
  getBestWeight: (exerciseId: string) => number | null;
  getLastWeight: (exerciseId: string) => number | null;
  // ─── ÚJ: Dark mode állapotok ───
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const defaultProfile: UserProfile = {
  name: "",
  goal: "",
  fitnessLevel: "",
  daysPerWeek: 3,
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboardedState] = useState(() =>
    localStorage.getItem("fitai_onboarded") === "true"
  );
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("fitai_profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>(() => {
    const saved = localStorage.getItem("fitai_schedule");
    return saved ? JSON.parse(saved) : getDefaultSchedule();
  });
  const [savedTemplates, setSavedTemplates] = useState<string[]>(() => {
    const saved = localStorage.getItem("fitai_templates");
    return saved ? JSON.parse(saved) : ["w1", "w3"];
  });
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>(() => {
    const saved = localStorage.getItem("fitai_sessions");
    return saved ? JSON.parse(saved) : getDefaultSessions();
  });
  const [weightLog, setWeightLog] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem("fitai_weights");
    return saved ? JSON.parse(saved) : [];
  });

  // ─── ÚJ: Dark mode állapot, mentés a localStorage-be (alapértelmezett: true) ───
  const [darkModeState, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem("fitai_darkmode");
    return saved ? JSON.parse(saved) : true;
  });

  // ─── ÚJ: Téma változtatása és osztály beállítása a gyökér (html) elemen ───
  useEffect(() => {
    if (darkModeState) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkModeState]);

  const setDarkMode = (v: boolean) => {
    localStorage.setItem("fitai_darkmode", String(v));
    setDarkModeState(v);
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const setOnboarded = (v: boolean) => {
    localStorage.setItem("fitai_onboarded", String(v));
    setOnboardedState(v);
  };

  const setUserProfile = (p: UserProfile) => {
    localStorage.setItem("fitai_profile", JSON.stringify(p));
    setUserProfileState(p);
  };

  const addToSchedule = (workoutId: string, dayIndex: number) => {
    const newEntry: ScheduledWorkout = {
      id: Date.now().toString(),
      workoutId,
      dayIndex,
      completed: false,
    };
    setSchedule(prev => {
      const updated = [...prev, newEntry];
      localStorage.setItem("fitai_schedule", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromSchedule = (id: string) => {
    setSchedule(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem("fitai_schedule", JSON.stringify(updated));
      return updated;
    });
  };

  const markComplete = (id: string) => {
    setSchedule(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, completed: true } : s);
      localStorage.setItem("fitai_schedule", JSON.stringify(updated));
      return updated;
    });
    const item = schedule.find(s => s.id === id);
    if (item) {
      const workout = allWorkouts.find(w => w.id === item.workoutId);
      if (workout) {
        const session: CompletedSession = {
          workoutId: workout.id,
          date: new Date().toISOString().split("T")[0],
          calories: workout.calories,
          duration: workout.duration,
        };
        addCompletedSession(session);
      }
    }
  };

  const saveTemplate = (workoutId: string) => {
    setSavedTemplates(prev => {
      if (prev.includes(workoutId)) return prev;
      const updated = [...prev, workoutId];
      localStorage.setItem("fitai_templates", JSON.stringify(updated));
      return updated;
    });
  };

  const removeTemplate = (workoutId: string) => {
    setSavedTemplates(prev => {
      const updated = prev.filter(id => id !== workoutId);
      localStorage.setItem("fitai_templates", JSON.stringify(updated));
      return updated;
    });
  };

  const addCompletedSession = (session: CompletedSession) => {
    setCompletedSessions(prev => {
      const updated = [...prev, session];
      localStorage.setItem("fitai_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  const logWeight = (exerciseId: string, weight: number) => {
    const entry: WeightEntry = {
      exerciseId,
      weight,
      date: new Date().toISOString().split("T")[0],
    };
    setWeightLog(prev => {
      const updated = [...prev, entry];
      localStorage.setItem("fitai_weights", JSON.stringify(updated));
      return updated;
    });
  };

  const getBestWeight = (exerciseId: string): number | null => {
    const entries = weightLog.filter(e => e.exerciseId === exerciseId);
    if (entries.length === 0) return null;
    return Math.max(...entries.map(e => e.weight));
  };

  const getLastWeight = (exerciseId: string): number | null => {
    const entries = weightLog.filter(e => e.exerciseId === exerciseId);
    if (entries.length === 0) return null;
    return entries[entries.length - 1].weight;
  };

  return (
    <AppContext.Provider
      value={{
        onboarded,
        setOnboarded,
        userProfile,
        setUserProfile,
        schedule,
        addToSchedule,
        removeFromSchedule,
        markComplete,
        savedTemplates,
        saveTemplate,
        removeTemplate,
        completedSessions,
        addCompletedSession,
        weightLog,
        logWeight,
        getBestWeight,
        getLastWeight,
        // ─── ÚJ: Átadjuk a contextnek a dark mode változókat ───
        darkMode: darkModeState,
        setDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

function getDefaultSchedule(): ScheduledWorkout[] {
  const today = new Date().getDay();
  const mondayIndex = today === 0 ? 6 : today - 1;
  return [
    { id: "s1", workoutId: "w1", dayIndex: mondayIndex, completed: false },
    { id: "s2", workoutId: "w3", dayIndex: (mondayIndex + 2) % 7, completed: true },
    { id: "s3", workoutId: "w2", dayIndex: (mondayIndex + 4) % 7, completed: false },
  ];
}

function getDefaultSessions(): CompletedSession[] {
  const today = new Date();
  const dates = [-6, -4, -2, -1].map(offset => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return d.toISOString().split("T")[0];
  });
  return [
    { workoutId: "w3", date: dates[0], calories: 450, duration: 35 },
    { workoutId: "w1", date: dates[1], calories: 320, duration: 45 },
    { workoutId: "w2", date: dates[2], calories: 380, duration: 50 },
    { workoutId: "w4", date: dates[3], calories: 120, duration: 25 },
  ];
}