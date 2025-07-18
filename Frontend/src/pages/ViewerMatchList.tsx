import { useMatches } from "../api/matchHooks";
import { useNavigate } from "react-router-dom";

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

const estadoClass = (completed: boolean) =>
  completed
    ? "bg-green-100 text-green-700 border border-green-300"
    : "bg-blue-100 text-blue-700 border border-blue-300";

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
                      match.completed
                    )}`}
                  >
                    {match.completed ? "Finalizado" : "Programado"}
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
                {match.completed && (
                  <div className="text-center text-lg font-bold text-gray-700 mb-2">
                    Resultado: {match.homeScore} - {match.awayScore}
                  </div>
                )}
                <div className="partido-actions flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    className="btn btn-primary py-3 px-7 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-base shadow hover:from-indigo-600 hover:to-purple-600 transition"
                    onClick={() => {
                      if (match.completed) {
                        navigate(`/match/${match._id}/report`);
                      } else if (onSelectMatch) {
                        onSelectMatch(match._id);
                      } else {
                        navigate(`/match/${match._id}/confirm-teams`);
                      }
                    }}
                  >
                    {match.completed ? "Ver Ficha" : "Ver Detalles"}
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
