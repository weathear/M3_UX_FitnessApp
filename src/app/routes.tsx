import { createBrowserRouter, redirect } from "react-router";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { MainLayout } from "./components/layout/MainLayout";
import { HomePage } from "./pages/HomePage";
import { CalendarPage } from "./pages/CalendarPage";
import { BrowsePage } from "./pages/BrowsePage";
import { AICoachPage } from "./pages/AICoachPage";
import { ProfilePage } from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    loader: () => {
      const onboarded = localStorage.getItem("fitai_onboarded") === "true";
      return onboarded ? redirect("/app/home") : redirect("/onboarding");
    },
    Component: () => null,
  },
  {
    path: "/onboarding",
    Component: OnboardingFlow,
  },
  {
    path: "/app",
    Component: MainLayout,
    children: [
      {
        index: true,
        loader: () => redirect("/app/home"),
        Component: () => null,
      },
      { path: "home", Component: HomePage },
      { path: "calendar", Component: CalendarPage },
      { path: "browse", Component: BrowsePage },
      { path: "ai", Component: AICoachPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);
