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
import TournamentDetail from "./pages/TournamentDetail";
import TournamentRegistrations from "./pages/TournamentRegistrations";
import PhaseForm from "./pages/PhaseForm";
import PhaseDetail from "./pages/PhaseDetail";
import PhaseFixture from "./pages/PhaseFixture";
import MatchdayList from "./pages/MatchdayList";
import RegistrationForm from "./pages/RegistrationForm";
import TeamList from "./pages/TeamList";
import TeamForm from "./pages/TeamForm";
import PlayerList from "./pages/PlayerList";
import PlayerForm from "./pages/PlayerForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EditTeamForm from "./pages/EditTeamForm";
import RegisterPlayer from "./pages/RegisterPlayer";

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

              {/* Tournament Routes */}
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
                path="/tournaments/:tournamentId"
                element={
                  <ProtectedRoute>
                    <TournamentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/:tournamentId/registrations"
                element={
                  <ProtectedRoute>
                    <TournamentRegistrations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/:tournamentId/register-team"
                element={
                  <ProtectedRoute>
                    <RegistrationForm />
                  </ProtectedRoute>
                }
              />

              {/* Phase Routes */}
              <Route
                path="/tournaments/:tournamentId/phases/new"
                element={
                  <ProtectedRoute>
                    <PhaseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/:tournamentId/phases/:phaseId"
                element={
                  <ProtectedRoute>
                    <PhaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/:tournamentId/phases/:phaseId/fixture"
                element={
                  <ProtectedRoute>
                    <PhaseFixture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournaments/:tournamentId/phases/:phaseId/matchdays"
                element={
                  <ProtectedRoute>
                    <MatchdayList />
                  </ProtectedRoute>
                }
              />

              {/* Other Routes */}
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
                path="/teams/:teamId/edit"
                element={
                  <ProtectedRoute>
                    <EditTeamForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/:teamId/players/register"
                element={
                  <ProtectedRoute>
                    <RegisterPlayer />
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
