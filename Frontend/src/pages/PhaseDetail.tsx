import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, TrashIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import { useTournament } from "../api/tournamentHooks";
import { usePhaseMatchdays } from "../api/fixtureHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";
import StandingsTable from "../components/tournaments/StandingsTable";
import PhaseDetails from "../components/tournaments/PhaseDetails";
import CalendarSection from "../components/tournaments/CalendarSection";
import { useResetTeamStats } from "../api/teamHooks";

const PhaseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();
  const [expandedMatchdays, setExpandedMatchdays] = useState<
    Record<string, boolean>
  >({});

  // Data fetching
  const { data: phase, isLoading: isPhaseLoading } = usePhase(phaseId);
  const { data: tournament } = useTournament(tournamentId!);
  const { data: matchdays = [], isLoading: isMatchdaysLoading } =
    usePhaseMatchdays(phaseId);
  const { data: registrations = [] } =
    useRegistrationsByTournament(tournamentId);
  const { mutate: resetStats } = useResetTeamStats();

  const isLoading = isPhaseLoading || isMatchdaysLoading;

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
            onClick={() => navigate(`/tournaments/${tournamentId}`)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver al Torneo</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{phase?.name}</h1>
            <p className="text-gray-600">{tournament?.name}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleResetStats}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 border border-red-600 rounded-md hover:bg-red-50"
            >
              <TrashIcon size={16} />
              Resetear Estadísticas
            </button>
          </div>
        </div>

        {/* Sección superior: Datos del torneo y tabla de posiciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Información de la fase */}
          <PhaseDetails
            phase={phase}
            registrationsCount={registrations.length}
          />

          {/* Tabla de Estadísticas */}
          <StandingsTable registrations={registrations} />
        </div>

        {/* Sección inferior: Lista de jornadas y partidos */}
        <CalendarSection
          matchdays={sortedMatchdays}
          expandedMatchdays={expandedMatchdays}
          onToggleMatchday={toggleMatchday}
          onGenerateFixture={handleGenerateFixture}
        />
      </main>
    </div>
  );
};

export default PhaseDetail;
