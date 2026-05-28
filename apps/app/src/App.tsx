import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { authClient } from "./lib/auth-client";
import { trpc } from "./lib/trpc";
import { AppLayout } from "./layouts/AppLayout";
import { AccountPage } from "./pages/AccountPage";
import { CalendarPage } from "./pages/CalendarPage";
import { FamilyOnboardingPage } from "./pages/FamilyOnboardingPage";
import { ManageFamilyPage } from "./pages/ManageFamilyPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ListDetailView } from "./pages/lists/ListDetailView";
import { ListsIndexView } from "./pages/lists/ListsIndexView";
import { LoginPage } from "./pages/LoginPage";
import { MealsPage } from "./pages/MealsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { RoutinesPage } from "./pages/RoutinesPage";
import { TodosPage } from "./pages/todos/TodosPage";

function useSession() {
  return authClient.useSession();
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending, isRefetching } = useSession();

  if (isPending || isRefetching) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: ReactNode }) {
  const {
    data: session,
    isPending: sessionPending,
    isRefetching: sessionRefetching,
  } = useSession();
  const { data: me, isLoading: meLoading } = trpc.users.me.useQuery(undefined, {
    enabled: !!session,
  });

  if (sessionPending || sessionRefetching || (session && meLoading)) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (me?.membership) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function FamilyRequiredRoute({ children }: { children: ReactNode }) {
  const {
    data: session,
    isPending: sessionPending,
    isRefetching: sessionRefetching,
  } = useSession();
  const { data: me, isLoading: meLoading } = trpc.users.me.useQuery(undefined, {
    enabled: !!session,
  });

  if (sessionPending || sessionRefetching || (session && meLoading)) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!me?.membership) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <FamilyOnboardingPage />
          </OnboardingRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <FamilyRequiredRoute>
              <AppLayout />
            </FamilyRequiredRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="routines" element={<RoutinesPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="meals" element={<MealsPage />} />
        <Route path="lists">
          <Route index element={<ListsIndexView />} />
          <Route path=":listId" element={<ListDetailView />} />
        </Route>
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="manage-family" element={<ManageFamilyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
