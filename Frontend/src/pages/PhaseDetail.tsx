import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  TrashIcon,
  UsersIcon,
  PlusIcon,
  EditIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import { useTournament, useUpdateTournament } from "../api/tournamentHooks";
import { usePhaseMatchdays } from "../api/fixtureHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";
import StandingsTable from "../components/tournaments/StandingsTable";
import PhaseDetails from "../components/tournaments/PhaseDetails";
import CalendarSection from "../components/tournaments/CalendarSection";
import { useResetTeamStats } from "../api/teamHooks";
import PlayersTable from "../components/tournaments/PlayersTable";
import BestDefenseTable from "../components/tournaments/BestDefenseTable";
import FairPlayTable from "../components/tournaments/FairPlayTable";

const PhaseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();
  const [expandedMatchdays, setExpandedMatchdays] = useState<
    Record<string, boolean>
  >({});
  const [isEditingTournamentName, setIsEditingTournamentName] = useState(false);
  const [tournamentName, setTournamentName] = useState("");

  // Data fetching
  const { data: phase, isLoading: isPhaseLoading } = usePhase(phaseId);
  const { data: tournament } = useTournament(tournamentId!);
  const { data: matchdays = [], isLoading: isMatchdaysLoading } =
    usePhaseMatchdays(phaseId);
  const { data: registrations = [] } =
    useRegistrationsByTournament(tournamentId);
  const { mutate: resetStats } = useResetTeamStats();
  const { mutate: updateTournament, isPending: isUpdatingTournament } =
    useUpdateTournament();

  const isLoading = isPhaseLoading || isMatchdaysLoading;

  // Inicializar el nombre del torneo cuando se carga
  React.useEffect(() => {
    if (tournament?.name) {
      setTournamentName(tournament.name);
    }
  }, [tournament?.name]);

  const toggleMatchday = (matchdayId: string) => {
    setExpandedMatchdays((prev) => ({
      ...prev,
      [matchdayId]: !prev[matchdayId],
    }));
  };

  // Sort matchdays by order
  const sortedMatchdays = [...matchdays].sort((a, b) => a.order - b.order);

  const handleGenerateFixture = () => {
    navigate(`/tournaments/${tournamentId}/phases/${phaseId}/fixture`);
  };

  const handleResetStats = () => {
    if (
      window.confirm(
        "¿Estás seguro que deseas resetear todas las estadísticas? Esta acción no se puede deshacer."
      )
    ) {
      resetStats(tournamentId!);
    }
  };

  const handleEditTournamentName = () => {
    setIsEditingTournamentName(true);
  };

  const handleSaveTournamentName = () => {
    if (tournamentName.trim() && tournamentName !== tournament?.name) {
      updateTournament(
        {
          id: tournamentId!,
          data: { name: tournamentName.trim() },
        },
        {
          onSuccess: () => {
            setIsEditingTournamentName(false);
          },
          onError: (error) => {
            console.error("Error al actualizar el nombre del torneo:", error);
            // Revertir al nombre original en caso de error
            setTournamentName(tournament?.name || "");
            setIsEditingTournamentName(false);
          },
        }
      );
    } else {
      setIsEditingTournamentName(false);
    }
  };

  const handleCancelEdit = () => {
    setTournamentName(tournament?.name || "");
    setIsEditingTournamentName(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando fase...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Fase no encontrada
            </h2>
            <button
              onClick={() => navigate(`/tournaments/${tournamentId}`)}
              className="text-blue-600 hover:text-blue-800"
            >
              Volver al torneo
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/tournaments`)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver al menu anterior</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{phase?.name}</h1>
            <div className="flex items-center gap-2">
              {isEditingTournamentName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveTournamentName();
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="text-gray-600 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    autoFocus
                    disabled={isUpdatingTournament}
                    placeholder={
                      isUpdatingTournament
                        ? "Guardando..."
                        : "Nombre del torneo"
                    }
                  />
                  <button
                    onClick={handleSaveTournamentName}
                    disabled={isUpdatingTournament}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                  >
                    <CheckIcon size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdatingTournament}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">{tournament?.name}</p>
                  <button
                    onClick={handleEditTournamentName}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar nombre del torneo"
                  >
                    <EditIcon size={14} />
                  </button>
                  {isUpdatingTournament && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="ml-auto flex gap-3">
            <button
              onClick={() =>
                navigate(`/tournaments/${tournamentId}/registrations`)
              }
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 border border-green-600 rounded-md hover:bg-green-50 transition"
            >
              <UsersIcon size={16} />
              <span>Administrar Equipos</span>
              <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                {registrations.length}
              </span>
            </button>
            <button
              onClick={handleResetStats}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 border border-red-600 rounded-md hover:bg-red-50"
            >
              <TrashIcon size={16} />
              Resetear Estadísticas
            </button>
          </div>
        </div>

        {/* Sección superior: PhaseDetails centrado y con tarjeta destacada */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white w-full p-0">
            <div className="p-0 flex justify-start">
              <PhaseDetails
                phase={phase}
                registrationsCount={registrations.length}
                matchdays={matchdays}
              />
            </div>
          </div>
        </div>

        {/* StandingsTable ajustada y banner a la derecha en md+ */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex justify-center">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-extrabold text-green-700 flex items-center gap-2">
                  <span className="text-3xl">🏆</span>
                  Tabla de Posiciones
                </h2>
              </div>
              <div className="max-w-fit">
                <StandingsTable registrations={registrations} />
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center h-full w-full">
            <div className="rounded-2xl shadow-xl bg-gradient-to-br from-green-400 via-yellow-200 to-white border-2 border-green-600 px-8 py-10 flex flex-col items-center">
              <span className="text-5xl mb-4">⚽</span>
              <span className="text-2xl font-bold text-green-900 mb-2 text-center">
                ¡Vive la pasión del fútbol!
              </span>
              <span className="text-lg text-green-800 text-center">
                Sigue las posiciones, estadísticas y el fair play de tu torneo
                en tiempo real.
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl shadow border border-indigo-400 bg-white">
            <div className="bg-indigo-600 rounded-t-xl px-4 py-2 flex items-center gap-2">
              <span className="text-xl">👥</span>
              <span className="text-white font-bold text-base">Jugadores</span>
            </div>
            <div className="p-2">
              <PlayersTable tournamentId={tournamentId!} />
            </div>
          </div>
          <div className="rounded-xl shadow border border-emerald-400 bg-white">
            <div className="bg-emerald-500 rounded-t-xl px-4 py-2 flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <span className="text-white font-bold text-base">
                Valla Menos Vencida
              </span>
            </div>
            <div className="p-2">
              <BestDefenseTable registrations={registrations} />
            </div>
          </div>
          <div className="rounded-xl shadow border border-amber-400 bg-white">
            <div className="bg-amber-500 rounded-t-xl px-4 py-2 flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <span className="text-white font-bold text-base">Fair Play</span>
            </div>
            <div className="p-2">
              <FairPlayTable registrations={registrations} />
            </div>
          </div>
        </div>

        {/* Sección inferior: Lista de jornadas y partidos */}
        <CalendarSection
          matchdays={sortedMatchdays}
          expandedMatchdays={expandedMatchdays}
          onToggleMatchday={toggleMatchday}
          onGenerateFixture={handleGenerateFixture}
          tournamentId={tournamentId!}
        />
      </main>
    </div>
  );
};

export default PhaseDetail;
