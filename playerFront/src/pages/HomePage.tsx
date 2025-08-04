import { useEffect, useState } from "react";
import { tournamentsApi, Tournament } from "../api/http";
import { PositionTable } from "../components/PositionTable";
import { TopScorers } from "../components/TopScorers";
import { NextMatchesTable } from "../components/NextMatchesTable";
import { WelcomeDivisionSelector } from "../components/WelcomeDivisionSelector";
import { PageLoader } from "../components/PageLoader";
import { TrophyIcon } from "lucide-react";

export function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | undefined
  >(() => localStorage.getItem("selectedTournamentId") || undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    tournamentsApi
      .getAll()
      .then((data) => {
        setTournaments(data);
        // Preselect the first tournament if none has been chosen before
        if (data.length > 0 && !selectedTournamentId) {
          const defaultId = data[0]._id;
          setSelectedTournamentId(defaultId);
          localStorage.setItem("selectedTournamentId", defaultId);
        }
      })
      .catch(() =>
        setError("Ocurrió un error al obtener los torneos disponibles.")
      )
      .finally(() => setLoading(false));
  }, []);

  const renderLoadingState = () => (
    <PageLoader message="Cargando datos del torneo..." />
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <div className="text-red-500 mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error al cargar datos
      </h3>
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeDivisionSelector
        title="¡Bienvenido a Loyal League!"
        description="Sigue todos los partidos, resultados y estadísticas de tu división favorita"
        tournaments={tournaments}
        selectedTournamentId={selectedTournamentId ?? ""}
        onTournamentChange={(tournamentId) => {
          if (tournamentId === "") {
            setSelectedTournamentId(undefined);
            localStorage.removeItem("selectedTournamentId");
          } else {
            setSelectedTournamentId(tournamentId);
            localStorage.setItem("selectedTournamentId", tournamentId);
          }
        }}
        loading={loading}
        error={error}
      />

      {/* Main Dashboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-black to-orange-600 p-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrophyIcon size={32} />
            {tournaments.find((t) => t._id === selectedTournamentId)?.name ??
              "Dashboard del Torneo"}
          </h2>
          <p className="text-orange-100 mt-2">
            Toda la información de tu liga en un solo lugar
          </p>
        </div>

        {loading && renderLoadingState()}
        {error && renderErrorState()}

        {!loading && !error && (
          <div className="p-6 space-y-8">
            {/* Content Sections */}
            <div className="space-y-8">
              {/* Next Matches Section */}
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <NextMatchesTable tournamentId={selectedTournamentId} />
              </div>

              {/* Position Table Section */}
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <PositionTable tournamentId={selectedTournamentId} />
              </div>

              {/* Top Scorers Section */}
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <TopScorers tournamentId={selectedTournamentId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
