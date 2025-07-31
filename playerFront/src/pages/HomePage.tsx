import { useEffect, useState } from "react";
import { tournamentsApi, Tournament } from "../api/http";
import { PositionTable } from "../components/PositionTable";
import { TopScorers } from "../components/TopScorers";
import { NextMatches } from "../components/NextMatches";
import { WelcomeDivisionSelector } from "../components/WelcomeDivisionSelector";
import {
  TrophyIcon,
  CalendarIcon,
  TargetIcon,
  UsersIcon,
  Loader2Icon,
} from "lucide-react";

export function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | undefined
  >();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    tournamentsApi
      .getAll()
      .then((data) => {
        setTournaments(data);
        // Preselect the first tournament so the page starts with data
        if (data.length > 0) {
          setSelectedTournamentId(data[0]._id);
        }
      })
      .catch(() =>
        setError("Ocurrió un error al obtener los torneos disponibles.")
      )
      .finally(() => setLoading(false));
  }, []);

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2Icon size={48} className="text-orange-600 animate-spin" />
      <span className="ml-3 text-lg text-gray-600">
        Cargando datos del torneo...
      </span>
    </div>
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
        onTournamentChange={(tournamentId) =>
          setSelectedTournamentId(
            tournamentId === "" ? undefined : tournamentId
          )
        }
        loading={loading}
        error={error}
      />

      {/* Main Dashboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-black to-orange-600 p-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrophyIcon size={32} />
            {(tournaments.find((t) => t._id === selectedTournamentId)?.name) ??
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
                <div className="bg-white p-4">
                  <h3 className="text-xl font-bold text-black flex items-center gap-2">
                    <CalendarIcon size={24} />
                    Próximos Partidos
                  </h3>
                </div>
                <div className="p-1">
                  <NextMatches tournamentId={selectedTournamentId} />
                </div>
              </div>

              {/* Position Table Section */}
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-white p-4">
                  <h3 className="text-xl font-bold text-black flex items-center gap-2">
                    <TrophyIcon size={24} />
                    Tabla de Posiciones
                  </h3>
                </div>
                <div className="p-1">
                  <PositionTable tournamentId={selectedTournamentId} />
                </div>
              </div>

              {/* Top Scorers Section */}
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-white p-4">
                  <h3 className="text-xl font-bold text-black flex items-center gap-2">
                    <TargetIcon size={24} />
                    Tabla de Goleadores
                  </h3>
                </div>
                <div className="p-1">
                  <TopScorers tournamentId={selectedTournamentId} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
