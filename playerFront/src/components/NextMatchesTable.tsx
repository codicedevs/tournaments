import { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, MapPinned } from "lucide-react";
import { tournamentsApi, matchdaysApi, Match } from "../api/http";
import { PageLoader } from "./PageLoader";

interface NextMatchesProps {
  tournamentId: string | undefined;
}

export function NextMatchesTable({ tournamentId }: NextMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tournamentId) {
      setMatches([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const tournament = await tournamentsApi.getById(tournamentId);
        const phaseId = tournament.phases?.[0]?._id;
        if (!phaseId) {
          setMatches([]);
          return;
        }

        const matchdays = await matchdaysApi.findByPhase(phaseId as string);
        const upcoming = matchdays
          .flatMap((md) => md.matches ?? [])
          .filter((m): m is Match => !!m)
          .filter((m) => new Date(m.date) > new Date())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 6);

        setMatches(upcoming);
      } catch (err) {
        console.error(err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tournamentId]);

  const renderMatchCard = (match: Match) => {
    const showStatusArr = ["Finalizado", "Completado", "En juego"];
    const showStatus = showStatusArr.includes(match.status ?? "");
    const showScore =
      showStatus &&
      match.homeScore !== undefined &&
      match.awayScore !== undefined;
    return (
      <article
        key={match._id}
        className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow hover:shadow-md hover:border-orange-300 transition-all duration-300 flex flex-col h-full min-h-[148px] hover:-translate-y-1"
      >
        {/* Fecha y hora */}
        <div className="flex justify-between items-center text-gray-600 text-xs mb-2">
          <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
            <CalendarIcon size={14} className="text-blue-600" />
            <span>
              {new Date(match.date).toLocaleDateString("es-AR")}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
            <ClockIcon size={14} className="text-green-600" />
            <span>
              {new Date(match.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Equipos */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center flex-1">
          <div className="w-full text-center font-bold text-sm md:text-base leading-tight break-words whitespace-normal max-w-[180px]">
            {(match as any).teamA?.name ?? "Equipo A"}
          </div>
          <div className="justify-self-center px-3 py-1 bg-gradient-to-r from-orange-600 to-black text-white rounded-full font-bold text-xs md:text-sm shadow min-w-[60px] text-center">
            {showScore ? `${match.homeScore} - ${match.awayScore}` : "VS"}
          </div>
          <div className="w-full text-center font-bold text-sm md:text-base leading-tight break-words whitespace-normal max-w-[180px]">
            {(match as any).teamB?.name ?? "Equipo B"}
          </div>
        </div>

        {/* Estado */}
        {showStatus && (
          <div className="text-center mt-1 text-xs font-semibold text-indigo-600">
            {match.status}
          </div>
        )}

        {/* Cancha */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <MapPinned size={14} className="shrink-0" />
          <span className="truncate">Cancha N° {match.fieldNumber ?? "-"}</span>
        </div>
      </article>
    );
  };

  if (!tournamentId) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 text-center">
        Selecciona un torneo para ver los próximos partidos.
      </section>
    );
  }

  if (loading) {
    return <PageLoader message="Cargando próximos partidos..." />;
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-white p-4">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <CalendarIcon size={24} /> Próximos Partidos
        </h3>
      </div>
      <div className="p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {matches.length > 0 ? (
          matches.map(renderMatchCard)
        ) : (
          <div className="text-center w-full col-span-full py-8 text-gray-600">
            No hay partidos próximos programados.
          </div>
        )}
      </div>
    </section>
  );
}
