import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamPlayers } from "../api/teamHooks";
import { useMatchById, useUpdatePlayerMatches } from "../api/matchHooks";
import type { Player, ConfirmTeamsProps } from "../interfaces/interfaces.match";

const minPlayers = 1;

const ConfirmTeams: React.FC<ConfirmTeamsProps> = ({
  matchId: propMatchId,
  onConfirm,
  onBack,
  soloLectura = false,
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const matchId = propMatchId || params.matchId;
  const { data: match, isLoading: loadingMatch } = useMatchById(matchId);
  const { mutate: updatePlayerMatches, isPending: updating } =
    useUpdatePlayerMatches();

  const teamAId = (match?.teamA as any)?._id || match?.teamA;
  const teamBId = (match?.teamB as any)?._id || match?.teamB;

  const { data: playersA = [], isLoading: loadingA } = useTeamPlayers(teamAId);
  const { data: playersB = [], isLoading: loadingB } = useTeamPlayers(teamBId);

  // Estados para selección y camisetas
  const [selectedA, setSelectedA] = useState<string[]>([]);
  const [selectedB, setSelectedB] = useState<string[]>([]);
  const [jerseysA, setJerseysA] = useState<{ [id: string]: number }>({});
  const [jerseysB, setJerseysB] = useState<{ [id: string]: number }>({});
  const [errorsA, setErrorsA] = useState<{ [id: string]: string }>({});
  const [errorsB, setErrorsB] = useState<{ [id: string]: string }>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const playerMatches = match?.playerMatches || [];

  useEffect(() => {
    if (
      playerMatches.length > 0 &&
      selectedA.length === 0 &&
      selectedB.length === 0
    ) {
      const selectedAInit: string[] = [];
      const selectedBInit: string[] = [];
      const jerseysAInit: { [id: string]: number } = {};
      const jerseysBInit: { [id: string]: number } = {};
      console.log("asd", playerMatches);
      playerMatches.forEach((pm) => {
        if (pm.teamId === teamAId) {
          selectedAInit.push(pm.playerId);
          jerseysAInit[pm.playerId] = pm.jerseyNumber;
        } else if (pm.teamId === teamBId) {
          selectedBInit.push(pm.playerId);
          jerseysBInit[pm.playerId] = pm.jerseyNumber;
        }
      });
      console.log("A", selectedAInit);
      console.log("B", selectedBInit);

      setSelectedA(selectedAInit);
      setSelectedB(selectedBInit);
      setJerseysA(jerseysAInit);
      setJerseysB(jerseysBInit);
    }
  }, [playerMatches, teamAId, teamBId]);

  // Helpers para validación
  const validateJersey = (playerId: string, value: string, team: "A" | "B") => {
    const num = parseInt(value);
    const jerseys = team === "A" ? jerseysA : jerseysB;
    const setJerseys = team === "A" ? setJerseysA : setJerseysB;
    const setErrors = team === "A" ? setErrorsA : setErrorsB;
    const selected = team === "A" ? selectedA : selectedB;
    if (!value || num < 1 || num > 100) {
      setErrors((prev) => ({ ...prev, [playerId]: "Número inválido (1-100)" }));
      setJerseys((prev) => ({ ...prev, [playerId]: NaN }));
      return false;
    }
    // Unicidad
    const used = Object.entries(jerseys)
      .filter(([id]) => id !== playerId && selected.includes(id))
      .map(([, n]) => n);
    if (used.includes(num)) {
      setErrors((prev) => ({ ...prev, [playerId]: "Número usado" }));
      setJerseys((prev) => ({ ...prev, [playerId]: num }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [playerId]: "" }));
    setJerseys((prev) => ({ ...prev, [playerId]: num }));
    return true;
  };

  // Selección de jugador
  const togglePlayer = (playerId: string, team: "A" | "B") => {
    const jerseys = team === "A" ? jerseysA : jerseysB;
    const setSelected = team === "A" ? setSelectedA : setSelectedB;
    const selected = team === "A" ? selectedA : selectedB;
    const setErrors = team === "A" ? setErrorsA : setErrorsB;
    if (!jerseys[playerId] || isNaN(jerseys[playerId])) {
      setErrors((prev) => ({
        ...prev,
        [playerId]: "Ingrese un número válido",
      }));
      return;
    }
    if (selected.includes(playerId)) {
      setSelected(selected.filter((id) => id !== playerId));
    } else {
      setSelected([...selected, playerId]);
    }
  };

  // Renderizado de jugadores
  const renderPlayers = (
    players: Player[],
    team: "A" | "B",
    selected: string[],
    jerseys: { [id: string]: number },
    errors: { [id: string]: string }
  ) => (
    <div className="max-h-[400px] overflow-y-auto pr-2">
      {players.map((player) => (
        <div
          key={player.playerId}
          className={`bg-white border-2 rounded-xl p-5 mb-4 transition-all
  ${
    !(player.enabled ?? player.user?.enabled)
      ? "border-red-400 bg-red-50 opacity-70"
      : selected.includes(player.playerId)
      ? "border-green-400 bg-green-50"
      : "border-gray-200 bg-white"
  }
`}
          id={`player-${player.playerId}`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-gray-800 text-lg">
              {player.user?.name}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                player.enabled ?? player.user?.enabled
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {player.enabled ?? player.user?.enabled
                ? "Habilitado"
                : "Inhabilitado"}
            </div>
          </div>
          <div
            className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center ${
              !(player.enabled ?? player.user?.enabled)
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">N°</label>
              <input
                type="number"
                className={`w-16 px-2 py-1 border-2 rounded-lg text-center font-semibold text-base ${
                  errors[player.playerId]
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                } focus:outline-none focus:border-blue-400`}
                min={1}
                max={100}
                value={jerseys[player.playerId] || ""}
                onChange={(e) =>
                  validateJersey(player.playerId, e.target.value, team)
                }
                disabled={
                  soloLectura || !(player.enabled ?? player.user?.enabled)
                }
              />
              {errors[player.playerId] && (
                <div className="text-xs text-red-500 mt-1">
                  {errors[player.playerId]}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-5 h-5 cursor-pointer"
                checked={selected.includes(player.playerId)}
                onChange={() => togglePlayer(player.playerId, team)}
                disabled={
                  soloLectura ||
                  !(player.enabled ?? player.user?.enabled) ||
                  !jerseys[player.playerId] ||
                  !!errors[player.playerId]
                }
                id={`check-${player.playerId}`}
              />
              <label
                htmlFor={`check-${player.playerId}`}
                className="text-sm text-gray-700 font-medium cursor-pointer"
              >
                Confirmar
              </label>
            </div>
            <button
              className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-700 transition"
              onClick={() =>
                alert(`Ver detalles del jugador ${player.user?.name}`)
              }
              type="button"
            >
              Detalles
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Indicadores de progreso
  const progressCircle = (count: number, team: 1 | 2) => (
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-all mb-2 ${
        count >= minPlayers
          ? "bg-gradient-to-br from-green-500 to-green-400 text-white border-green-500"
          : "bg-gray-100 text-red-500 border-red-400"
      }`}
      id={`circle-team${team}`}
    >
      {count}/{minPlayers}
    </div>
  );

  const progressStatus = (count: number) => (
    <div
      className={`font-semibold text-base ${
        count >= minPlayers ? "text-green-600" : "text-red-600"
      }`}
      id={`status-team1`}
    >
      {count >= minPlayers ? "Equipo listo" : "Faltan jugadores"}
    </div>
  );

  // Indicadores de abajo
  const readyIndicator = (count: number, teamName: string, team: 1 | 2) => (
    <div
      className={`bg-white p-5 rounded-xl border-4 transition-all mb-2 ${
        count >= minPlayers ? "border-green-400 bg-green-50" : "border-gray-200"
      }`}
      id={`ready-team${team}`}
    >
      <div
        className={`text-4xl mb-2 ${
          count >= minPlayers ? "text-green-500" : "text-red-500"
        }`}
        id={`ready-icon${team}`}
      >
        {count >= minPlayers ? "✅" : "❌"}
      </div>
      <div className="font-semibold text-lg text-gray-800 mb-1">{teamName}</div>
      <div className="text-sm text-gray-600" id={`ready-count${team}`}>
        {count} de {minPlayers} mínimo
      </div>
    </div>
  );

  // Nombres de equipos
  const teamAName = match?.teamA?.name || "Equipo A";
  const teamBName = match?.teamB?.name || "Equipo B";

  // Botón iniciar partido
  const canStart =
    selectedA.length >= minPlayers && selectedB.length >= minPlayers;

  const handleConfirmTeams = () => {
    if (!matchId) return;
    // Armar el array playerMatches con más datos
    const playerMatchesA = selectedA.map((playerId) => {
      const player = playersA.find((p: any) => p.playerId === playerId);
      return {
        playerId,
        jerseyNumber: jerseysA[playerId],
        enableToPlay: true,
        name: player?.user?.name,
        email: player?.user?.email,
        phone: player?.user?.phone,
        profilePicture: player?.user?.profilePicture,
        teamId: teamAId, // <--- AGREGADO
      };
    });
    const playerMatchesB = selectedB.map((playerId) => {
      const player = playersB.find((p: any) => p.playerId === playerId);
      return {
        playerId,
        jerseyNumber: jerseysB[playerId],
        enableToPlay: true,
        name: player?.user?.name,
        email: player?.user?.email,
        phone: player?.user?.phone,
        profilePicture: player?.user?.profilePicture,
        teamId: teamBId, // <--- AGREGADO
      };
    });
    const playerMatches = [...playerMatchesA, ...playerMatchesB];
    updatePlayerMatches(
      { matchId, playerMatches },
      {
        onSuccess: () => {
          if (onConfirm) {
            onConfirm(playerMatches);
          } else {
            navigate(`/match/${matchId}/OnMatch`, {
              state: {
                confirmedPlayers: playerMatches,
              },
            });
          }
        },
      }
    );
  };

  const handleSave = () => {
    if (!matchId) return;
    setSaveStatus("saving");
    const playerMatchesA = selectedA.map((playerId) => {
      const player = playersA.find((p: any) => p.playerId === playerId);
      return {
        playerId,
        jerseyNumber: jerseysA[playerId],
        enableToPlay: true,
        name: player?.user?.name,
        email: player?.user?.email,
        phone: player?.user?.phone,
        profilePicture: player?.user?.profilePicture,
        teamId: teamAId,
      };
    });
    const playerMatchesB = selectedB.map((playerId) => {
      const player = playersB.find((p: any) => p.playerId === playerId);
      return {
        playerId,
        jerseyNumber: jerseysB[playerId],
        enableToPlay: true,
        name: player?.user?.name,
        email: player?.user?.email,
        phone: player?.user?.phone,
        profilePicture: player?.user?.profilePicture,
        teamId: teamBId,
      };
    });
    const playerMatches = [...playerMatchesA, ...playerMatchesB];
    updatePlayerMatches(
      { matchId, playerMatches },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        },
        onError: () => {
          setSaveStatus("idle");
        },
      }
    );
  };

  if (loadingMatch) return <div>Cargando...</div>;
  if (!match) return <div>No se encontró el partido</div>;

  return (
    <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white px-10 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-light mb-1">Gestión de Jugadores</h1>
            <div className="text-lg opacity-90">
              {teamAName} vs {teamBName}
            </div>
          </div>
          <button
            className="bg-white/20 text-white px-6 py-3 rounded-xl text-lg hover:bg-white/30 transition"
            onClick={() => (onBack ? onBack() : navigate(-1))}
          >
            ← Volver
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        {/* Equipo 1 */}
        <div className="p-10 border-b-2 md:border-b-0 md:border-r-2 border-gray-200">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 -mx-10 -mt-10 mb-8 p-8 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-center text-gray-800 mb-3">
              {teamAName}
            </div>
            <div className="bg-white rounded-xl p-5 text-center border-2 border-gray-200 flex flex-col items-center">
              {progressCircle(selectedA.length, 1)}
              <div className="text-sm text-gray-500 mb-1">
                Jugadores confirmados
              </div>
              {progressStatus(selectedA.length)}
            </div>
          </div>
          {renderPlayers(playersA, "A", selectedA, jerseysA, errorsA)}
        </div>
        {/* Equipo 2 */}
        <div className="p-10">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 -mx-10 -mt-10 mb-8 p-8 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-center text-gray-800 mb-3">
              {teamBName}
            </div>
            <div className="bg-white rounded-xl p-5 text-center border-2 border-gray-200 flex flex-col items-center">
              {progressCircle(selectedB.length, 2)}
              <div className="text-sm text-gray-500 mb-1">
                Jugadores confirmados
              </div>
              {progressStatus(selectedB.length)}
            </div>
          </div>
          {renderPlayers(playersB, "B", selectedB, jerseysB, errorsB)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-10 border-t-2 border-gray-200 text-center">
        <div className="flex justify-end gap-3">
          {soloLectura ? (
            <button
              className="w-36 h-10 bg-gradient-to-br from-green-500 to-green-400 text-white px-6 py-2 rounded-lg text-base font-bold tracking-wider shadow hover:-translate-y-0.5 hover:shadow-lg transition flex items-center justify-center"
              onClick={() => {
                if (onConfirm) {
                  onConfirm([]); // Puedes pasar los jugadores confirmados si los tienes en estado
                } else if (matchId) {
                  navigate(`/match/${matchId}/OnMatch`);
                }
              }}
            >
              al partido
            </button>
          ) : (
            <>
              <button
                className={`w-36 h-10 px-5 py-2 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2
            ${
              saveStatus === "saved"
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }
            disabled:bg-gray-400 disabled:cursor-not-allowed`}
                onClick={handleSave}
                disabled={
                  saveStatus === "saving" ||
                  saveStatus === "saved" ||
                  updating ||
                  soloLectura
                }
              >
                {saveStatus === "saving" && "Guardando..."}
                {saveStatus === "saved" && (
                  <span className="text-s">✔ Guardado</span>
                )}
                {saveStatus === "idle" && "Guardar"}
              </button>
              <button
                className="w-36 h-10 bg-gradient-to-br from-green-500 to-green-400 text-white px-6 py-2 rounded-lg text-base font-bold tracking-wider shadow disabled:bg-gray-400 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg transition flex items-center justify-center"
                disabled={!canStart || updating}
                onClick={handleConfirmTeams}
              >
                {updating ? "Guardando..." : "Al partido"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmTeams;
