import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TournamentList from "./pages/TournamentList";
import TournamentForm from "./pages/TournamentForm";
import TeamList from "./pages/TeamList";
import TeamForm from "./pages/TeamForm";
import PlayerList from "./pages/PlayerList";
import PlayerForm from "./pages/PlayerForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments"
                element={
                  <ProtectedRoute>
                    <TournamentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/new"
                element={
                  <ProtectedRoute>
                    <TournamentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <TeamList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/new"
                element={
                  <ProtectedRoute>
                    <TeamForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/players"
                element={
                  <ProtectedRoute>
                    <PlayerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/players/new"
                element={
                  <ProtectedRoute>
                    <PlayerForm />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}
