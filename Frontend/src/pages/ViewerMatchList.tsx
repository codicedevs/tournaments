import { useMatches } from "../api/matchHooks";
import { useNavigate } from "react-router-dom";
import { MatchStatus } from "../models/Match";

interface ViewerMatchListProps {
  viewerId: string;
  onSelectMatch?: (id: string) => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}
function formatTime(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const estadoClass = (status: MatchStatus, match: any) => {
  // Si el status es UNASSIGNED pero tiene fecha y hora, mostrar como Programado
  if (status === MatchStatus.UNASSIGNED && match.date) {
    return "bg-blue-100 text-blue-700 border border-blue-300";
  }
  switch (status) {
    case MatchStatus.IN_PROGRESS:
      return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    case MatchStatus.FINISHED:
      return "bg-green-100 text-green-700 border border-green-300";
    case MatchStatus.COMPLETED:
      return "bg-green-400 text-green-900 border border-gray-400";
    case MatchStatus.SCHEDULED:
      return "bg-blue-100 text-blue-700 border border-blue-300";
    default:
      return "bg-gray-100 text-gray-500 border border-gray-200";
  }
};
const estadoTexto = (status: MatchStatus, match: any) => {
  if (status === MatchStatus.UNASSIGNED && match.date) {
    return "Programado";
  }
  switch (status) {
    case MatchStatus.UNASSIGNED:
      return "Sin programar";
    case MatchStatus.SCHEDULED:
      return "Programado";
    case MatchStatus.IN_PROGRESS:
      return "En juego";
    case MatchStatus.FINISHED:
      return "Finalizado";
    case MatchStatus.COMPLETED:
      return "Completado";
    default:
      return "-";
  }
};

const ViewerMatchList = ({ viewerId, onSelectMatch }: ViewerMatchListProps) => {
  const { data: matchesByViewer } = useMatches({ viewerId });
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl  my-10 overflow-hidden">
      <div className="px-8 py-10">
        {matchesByViewer?.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No hay partidos asignados.
          </div>
        )}
        <div className="space-y-8">
          {matchesByViewer?.map((match) => {
            const torneo =
              typeof match.matchDayId === "object" &&
              match.matchDayId?.phaseId &&
              typeof match.matchDayId.phaseId === "object"
                ? match.matchDayId.phaseId.tournamentId &&
                  typeof match.matchDayId.phaseId.tournamentId === "object"
                  ? match.matchDayId.phaseId.tournamentId.name
                  : "-"
                : "-";
            return (
              <div
                key={match._id}
                className="partido-card bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="vs-container text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">
                      <span className="equipo text-xl md:text-2xl font-semibold text-gray-700">
                        {match.teamA?.name || "Equipo A"}
                      </span>
                      <span className="mx-3 text-gray-400 font-bold">VS</span>
                      <span className="equipo text-xl md:text-2xl font-semibold text-gray-700">
                        {match.teamB?.name || "Equipo B"}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`estado px-5 py-2 rounded-full text-sm font-bold capitalize border ${estadoClass(
                      match.status,
                      match
                    )}`}
                  >
                    {estadoTexto(match.status, match)}
                  </div>
                </div>
                <div className="partido-info grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                  <div className="info-item text-center">
                    <div className="info-label text-gray-500 text-sm mb-1 font-medium">
                      Fecha y Hora
                    </div>
                    <div className="fecha-hora flex flex-col items-center">
                      <div className="fecha font-semibold text-gray-800 text-lg">
                        {formatDate(match.date)}
                      </div>
                      <div className="hora text-gray-500 text-base mt-1">
                        {formatTime(match.date)}
                      </div>
                    </div>
                  </div>
                  <div className="info-item text-center">
                    <div className="info-label text-gray-500 text-sm mb-1 font-medium">
                      Cancha
                    </div>
                    <div className="cancha-info flex items-center justify-center gap-2">
                      <div className="cancha-numero bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                        {match.fieldNumber || "-"}
                      </div>
                      <div className="cancha-texto font-semibold text-gray-700">
                        {match.fieldNumber
                          ? `Cancha ${match.fieldNumber}`
                          : "Sin asignar"}
                      </div>
                    </div>
                  </div>
                  <div className="info-item text-center">
                    <div className="info-label text-gray-500 text-sm mb-1 font-medium">
                      Torneo
                    </div>
                    <div className="font-semibold text-gray-800 text-lg">
                      {torneo}
                    </div>
                  </div>
                </div>
                {(match.status === MatchStatus.FINISHED ||
                  match.status === MatchStatus.COMPLETED) && (
                  <div className="text-center text-lg font-bold text-gray-700 mb-2">
                    Resultado: {match.homeScore} - {match.awayScore}
                  </div>
                )}
                <div className="partido-actions flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    className="btn btn-primary py-3 px-7 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-base shadow hover:from-indigo-600 hover:to-purple-600 transition"
                    onClick={() => {
                      if (
                        match.status === MatchStatus.FINISHED ||
                        match.status === MatchStatus.COMPLETED
                      ) {
                        navigate(`/match/${match._id}/report`);
                      } else if (onSelectMatch) {
                        onSelectMatch(match._id);
                      } else {
                        navigate(`/match/${match._id}/confirm-teams`);
                      }
                    }}
                  >
                    {match.status === MatchStatus.COMPLETED ||
                    match.status === MatchStatus.FINISHED
                      ? "Ver Ficha"
                      : "Ver Detalles"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewerMatchList;
