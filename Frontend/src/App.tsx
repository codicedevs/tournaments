import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import Dashboard from "./pages/Dashboard";
import TournamentList from "./pages/TournamentList";
import TournamentForm from "./pages/TournamentForm";

import TournamentRegistrations from "./pages/TournamentRegistrations";
import PhaseForm from "./pages/PhaseForm";

import TeamList from "./pages/TeamList";
import TeamForm from "./pages/TeamForm";
import UserList from "./pages/UserList";
import UserCreate from "./pages/UserCreate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import RegisterPlayer from "./pages/RegisterPlayer";
import TeamPlayers from "./pages/TeamPlayers";
import { authLoader } from "./authLoader";
import TournamentDetail from "./pages/TournamentDetail";
import RegistrationForm from "./pages/RegistrationForm";
import PhaseDetail from "./pages/PhaseDetail";
import PhaseFixture from "./pages/PhaseFixture";
import MatchdayList from "./pages/MatchdayList";
import EditTeamForm from "./pages/EditTeamForm";
import UserEdit from "./pages/UserEdit";
import ViewerMatchList from "./pages/ViewerMatchList";
import MatchOn from "./pages/MatchOn";
import ConfirmTeams from "./pages/ComfirmTeams";
import ViewerMatchFlow from "./pages/ViewerMatchFlow";
import MatchReport from "./pages/MatchReport";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/change-password", element: <ChangePasswordPage /> },
  { path: "/dashboard", element: <Dashboard />, loader: authLoader },
  { path: "/tournaments", element: <TournamentList />, loader: authLoader },
  { path: "/tournaments/new", element: <TournamentForm />, loader: authLoader },
  {
    path: "/tournaments/:tournamentId",
    element: <TournamentDetail />,
    loader: authLoader,
  },
  {
    path: "/tournaments/:tournamentId/registrations",
    element: <TournamentRegistrations />,
    loader: authLoader,
  },
  {
    path: "/tournaments/:tournamentId/register-team",
    element: <RegistrationForm />,
    loader: authLoader,
  },
  {
    path: "/tournaments/:tournamentId/phases/new",
    element: <PhaseForm />,
    loader: authLoader,
  },
  {
    path: "/tournaments/:tournamentId/phases/:phaseId",
    element: <PhaseDetail />,
    loader: authLoader,
  },
  {
    path: "/tournaments/:tournamentId/phases/:phaseId/fixture",
    element: <PhaseFixture />,
    loader: authLoader,
  },
  {
    path: "/tournaments/:tournamentId/phases/:phaseId/matchdays",
    element: <MatchdayList />,
    loader: authLoader,
  },
  { path: "/teams", element: <TeamList />, loader: authLoader },
  { path: "/teams/new", element: <TeamForm />, loader: authLoader },
  {
    path: "/teams/:teamId/edit",
    element: <EditTeamForm />,
    loader: authLoader,
  },
  {
    path: "/teams/:teamId/players/register",
    element: <RegisterPlayer />,
    loader: authLoader,
  },
  {
    path: "/teams/:teamId/players",
    element: <TeamPlayers />,
    loader: authLoader,
  },
  { path: "/users", element: <UserList />, loader: authLoader },
  { path: "/users/new", element: <UserCreate />, loader: authLoader },
  { path: "/users/:id/edit", element: <UserEdit />, loader: authLoader },
  {
    path: "/matches/viewer",
    element: <ViewerMatchList viewerId="685465ed46b6f459e522b19e" />,
  },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/match/:matchId/confirm-teams", element: <ConfirmTeams /> },
  { path: "/match/:matchId/OnMatch", element: <MatchOn /> },
  {
    path: "/match/viewerFlow",
    element: <ViewerMatchFlow />,
  },
  {
    path: "/match/:matchId/report",
    element: <MatchReport confirmedPlayers={[]} />,
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </QueryClientProvider>
  );
}
