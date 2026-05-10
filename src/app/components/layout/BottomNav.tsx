import { useNavigate, useLocation } from "react-router";
import { Home, CalendarDays, Dumbbell, Bot, User } from "lucide-react";

const ACCENT = "#CCFF00";

const tabs = [
  { path: "/app/home", icon: Home, label: "Home" },
  { path: "/app/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/app/browse", icon: Dumbbell, label: "Workouts" },
  { path: "/app/ai", icon: Bot, label: "AI Coach" },
  { path: "/app/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="shrink-0 flex items-stretch w-full transition-colors duration-300"
      style={{
        // Dinamikus háttér a CSS változó alapján, enyhe áttetszőséggel
        background: "var(--popover)", 
        opacity: 0.98,
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
            style={{ 
              // Aktív állapotban az ACCENT színt használja, különben a téma szerinti tompított szöveget
              color: isActive ? ACCENT : "var(--muted-foreground)" 
            }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span
              className="text-[10px] tracking-wide"
              style={{
                fontWeight: isActive ? 700 : 400,
                color: isActive ? ACCENT : "var(--muted-foreground)",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}