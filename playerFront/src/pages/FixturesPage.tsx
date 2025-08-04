import { useEffect, useState } from "react";
import {
  tournamentsApi,
  matchdaysApi,
  Tournament,
  Matchday,
  Match,
} from "../api/http";
import {
  CalendarIcon,
  ClockIcon,
  MapPinned,
  ChevronDownIcon,
  ChevronUpIcon,
  AlertCircleIcon,
} from "lucide-react";
import { WelcomeDivisionSelector } from "../components/WelcomeDivisionSelector";
import { PageLoader } from "../components/PageLoader";

export function FixturesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    () => localStorage.getItem("selectedTournamentId") || ""
  );
  const [matchdays, setMatchdays] = useState<Matchday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMatchdays, setExpandedMatchdays] = useState<Set<string>>(
    new Set()
  );

  // Fetch tournaments on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await tournamentsApi.getAll();
        setTournaments(data);
        // Preselect the first tournament if none stored
        if (data.length > 0 && !selectedTournamentId) {
          const defaultId = data[0]._id;
          setSelectedTournamentId(defaultId);
          localStorage.setItem("selectedTournamentId", defaultId);
        }
      } catch {
        setError("Error obteniendo torneos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch matchdays when tournament changes
  useEffect(() => {
    if (!selectedTournamentId) {
      setMatchdays([]);
      return;
    }

    const tournament = tournaments.find((t) => t._id === selectedTournamentId);
    const phaseId = tournament?.phases?.[0]?._id;
    if (!phaseId) {
      setError("El torneo seleccionado no tiene phaseId asociado.");
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const mds = await matchdaysApi.findByPhase(phaseId as string);
        setMatchdays(mds);
      } catch {
        setError("Error obteniendo jornadas");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedTournamentId, tournaments]);

  const toggleMatchday = (matchdayId: string) => {
    const newExpanded = new Set(expandedMatchdays);
    if (newExpanded.has(matchdayId)) {
      newExpanded.delete(matchdayId);
    } else {
      newExpanded.add(matchdayId);
    }
    setExpandedMatchdays(newExpanded);
  };

  const renderMatch = (match: Match) => (
    <article
      key={match._id}
      className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col min-h-[148px]"
    >
      <div className="flex justify-between items-center text-gray-600 text-sm mb-4">
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
          <CalendarIcon size={16} className="text-blue-600" />
          <span className="font-medium">
            {new Date(match.date).toLocaleDateString("es-AR")}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">
          <MapPinned size={16} className="text-indigo-600" />
          <span className="font-medium">
            Cancha N° {(match as any).fieldNumber ?? "-"}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
          <ClockIcon size={16} className="text-green-600" />
          <span className="font-medium">
            {new Date(match.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center flex-1">
        <div className="w-full text-center font-bold text-sm md:text-base leading-tight break-words whitespace-normal max-w-[180px]">
          {(match as any).teamA?.name || "--"}
        </div>
        <div className="justify-self-center px-4 py-1 bg-gradient-to-r from-orange-600 to-black text-white rounded-full font-bold text-xs md:text-sm shadow">
          VS
        </div>
        <div className="w-full text-center font-bold text-sm md:text-base leading-tight break-words whitespace-normal max-w-[180px]">
          {(match as any).teamB?.name || "--"}
        </div>
      </div>
    </article>
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="h-20 bg-gray-100 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderError = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <AlertCircleIcon size={48} className="text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        ¡Oops! Algo salió mal
      </h3>
      <p className="text-red-600">{error}</p>
    </div>
  );

  if (loading && tournaments.length === 0) {
    return <PageLoader message="Cargando división..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeDivisionSelector
        title="Fixture de Partidos"
        description="Consulta todos los partidos programados y resultados de tu división"
        tournaments={tournaments}
        selectedTournamentId={selectedTournamentId}
        onTournamentChange={(id) => {
          setSelectedTournamentId(id);
          if (id === "") {
            localStorage.removeItem("selectedTournamentId");
          } else {
            localStorage.setItem("selectedTournamentId", id);
          }
        }}
      />

      {/* Content Section */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-black to-orange-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarIcon size={28} />
            Calendario de Partidos
          </h2>
          <p className="text-blue-100 mt-2">
            Explora todas las jornadas y sus partidos
          </p>
        </div>

        <div className="p-6">
          {loading && renderLoadingSkeleton()}
          {!loading && error && renderError()}

          {/* Matchdays List */}
          {!loading && !error && matchdays.length > 0 && (
            <div className="space-y-6">
              {matchdays.map((md) => {
                const isExpanded = expandedMatchdays.has(md._id);
                return (
                  <div
                    key={md._id}
                    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleMatchday(md._id)}
                      className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 p-6 text-left transition-all duration-300 flex items-center justify-between group"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                          Jornada {md.order}
                        </h3>
                        {/* {md.date && (
                          <p className="text-gray-600 mt-1">
                            {new Date(md.date).toLocaleDateString("es-AR", {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        )} */}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {md.matches?.length || 0} partidos
                        </span>
                        {isExpanded ? (
                          <ChevronUpIcon
                            size={24}
                            className="text-gray-500 group-hover:text-blue-600 transition-colors"
                          />
                        ) : (
                          <ChevronDownIcon
                            size={24}
                            className="text-gray-500 group-hover:text-blue-600 transition-colors"
                          />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-200 p-6 animate-in slide-in-from-top-2 duration-300">
                        {md.matches?.length ? (
                          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                            {md.matches.map((m) => renderMatch(m as Match))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CalendarIcon
                              size={48}
                              className="text-gray-400 mx-auto mb-4"
                            />
                            <p className="text-gray-600 text-lg">
                              No hay partidos programados para esta jornada
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && matchdays.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay jornadas disponibles
              </h3>
              <p className="text-gray-500">
                Selecciona un torneo para ver las jornadas y partidos
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
