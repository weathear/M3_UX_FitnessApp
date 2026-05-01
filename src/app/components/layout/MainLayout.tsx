import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";

export function MainLayout() {
  return (
    <div
      className="bg-black flex justify-center overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div className="w-full max-w-[430px] flex flex-col overflow-hidden">
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}