import { useNavigate, useLocation } from "react-router";
import { Home, CalendarDays, Dumbbell, Bot, User } from "lucide-react";

const ACCENT = "#CCFF00";

const tabs = [
  { path: "/app/home", icon: Home, label: "Home" },
  { path: "/app/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/app/browse", icon: Dumbbell, label: "Browse" },
  { path: "/app/ai", icon: Bot, label: "AI Coach" },
  { path: "/app/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="shrink-0 flex items-stretch w-full"
      style={{
        background: "rgba(9,9,11,0.98)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid #1C1C1E",
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
            style={{ color: isActive ? ACCENT : "#71717A" }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span
              className="text-[10px] tracking-wide"
              style={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? ACCENT : "#71717A",
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