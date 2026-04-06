import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./components/LoginPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { Dashboard } from "./components/Dashboard";
import { EntryEditor } from "./components/EntryEditor";
import { PublicEntryView } from "./components/PublicEntryView";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", Component: LoginPage },
  { path: "/reset-password", Component: ResetPasswordPage },
  { path: "/dashboard", Component: Dashboard },
  { path: "/editor/new", Component: EntryEditor },
  { path: "/editor/:id", Component: EntryEditor },
  { path: "/entry/:id", Component: PublicEntryView },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
