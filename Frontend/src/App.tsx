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
import RegistrationForm from "./pages/RegistrationForm";
import PhaseDetail from "./pages/PhaseDetail";
import PhaseFixture from "./pages/PhaseFixture";
import MatchdayList from "./pages/MatchdayList";

import UserEdit from "./pages/UserEdit";
import ViewerMatchList from "./pages/ViewerMatchList";
import ConfirmTeams from "./pages/ComfirmTeams";
import ViewerMatchFlow from "./pages/ViewerMatchFlow";
import MatchReport from "./pages/MatchReport";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/login", element: <LoginPage /> },
    { path: "/change-password", element: <ChangePasswordPage /> },
    { path: "/dashboard", element: <Dashboard />, loader: authLoader },
    { path: "/divisions", element: <TournamentList />, loader: authLoader },
    { path: "/divisions/new", element: <TournamentForm />, loader: authLoader },
    // {
    //   path: "/divisions/:tournamentId",
    //   element: <TournamentDetail />,
    //   loader: authLoader,
    // },
    {
      path: "/divisions/:tournamentId/registrations",
      element: <TournamentRegistrations />,
      loader: authLoader,
    },
    {
      path: "/divisions/:tournamentId/register-team",
      element: <RegistrationForm />,
      loader: authLoader,
    },
    {
      path: "/divisions/:tournamentId/phases/new",
      element: <PhaseForm />,
      loader: authLoader,
    },
    {
      path: "/divisions/:tournamentId/phases/:phaseId",
      element: <PhaseDetail />,
      loader: authLoader,
    },
    {
      path: "/divisions/:tournamentId/phases/:phaseId/fixture",
      element: <PhaseFixture />,
      loader: authLoader,
    },
    {
      path: "/divisions/:tournamentId/phases/:phaseId/matchdays",
      element: <MatchdayList />,
      loader: authLoader,
    },
    { path: "/teams", element: <TeamList />, loader: authLoader },
    {
      path: "/teams/new",
      element: <TeamForm mode="create" />,
      loader: authLoader,
    },
    {
      path: "/teams/:teamId/edit",
      element: <TeamForm mode="edit" />,
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
    {
      path: "/match/viewerFlow",
      element: <ViewerMatchFlow />,
    },
    {
      path: "/match/:matchId/report",
      element: <MatchReport confirmedPlayers={[]} />,
    },
  ],
  {
    basename: "/admin",
  }
);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </QueryClientProvider>
  );
}
