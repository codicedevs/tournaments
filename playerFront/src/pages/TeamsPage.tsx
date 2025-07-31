import { useEffect, useState } from "react";
import {
  teamsApi,
  Team,
  Player,
  registrationApi,
  tournamentsApi,
  Tournament,
  Registration,
} from "../api/http";
import { Modal } from "../components/Modal";
import { WelcomeDivisionSelector } from "../components/WelcomeDivisionSelector";
import { TrophyIcon, UsersIcon, TargetIcon, ShieldIcon, Loader2Icon, AlertCircleIcon } from "lucide-react";

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamRegistrations, setTeamRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  // Fetch tournaments on mount and preselect the first one
  useEffect(() => {
    (async () => {
      try {
        const tData = await tournamentsApi.getAll();
        setTournaments(tData);
        if (tData.length > 0) {
          setSelectedTournamentId(tData[0]._id);
        }
      } catch {
        setError("Error fetching tournaments");
      }
    })();
  }, []);

  // Fetch teams whenever the selected tournament changes
  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedTournamentId) {
        setTeams([]);
        setTeamRegistrations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const regs: any[] = await registrationApi.getByTournament(
          selectedTournamentId
        );
        // Cada registro tiene el equipo populado en teamId
        const tournamentTeams: Team[] = regs.map((r) => r.teamId as Team);
        console.log(tournamentTeams);
        setTeams(tournamentTeams);
        setTeamRegistrations(regs);
      } catch {
        setError("Error fetching teams");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [selectedTournamentId]);

  const getTeamStats = (team: Team) => {
    const registration = teamRegistrations.find(
      (r) => (r.teamId as any)?._id === team._id || r.teamId === team._id
    );
    return (
      registration?.stats || {
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      }
    );
  };

  const openTeamModal = async (team: Team) => {
    setPlayersError(null);
    if (!team.players) {
      try {
        setPlayersLoading(true);
        const playersData = await teamsApi.players(team._id);
        const normalizedPlayers = playersData.map((p: any) => ({
          ...p,
          name: p.name || p.userId?.name || "Sin nombre",
        }));
        team.players = normalizedPlayers as Player[];
      } catch (e) {
        setPlayersError("Error fetching players");
      } finally {
        setPlayersLoading(false);
      }
    }
    setSelectedTeam({ ...team });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2Icon size={48} className="text-orange-600 animate-spin" />
      <span className="ml-3 text-lg text-gray-600">Cargando equipos...</span>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <AlertCircleIcon size={48} className="text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">¡Oops! Algo salió mal</h3>
      <p className="text-red-600">{error}</p>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeDivisionSelector
        title="Equipos de la Liga"
        description="Conoce todos los equipos participantes y sus jugadores"
        tournaments={tournaments}
        selectedTournamentId={selectedTournamentId}
        onTournamentChange={setSelectedTournamentId}
      />

      {/* Content Section */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-black to-orange-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldIcon size={28} />
            Equipos de la División
          </h2>
          <p className="text-orange-100 mt-2">Explora todos los equipos y sus estadísticas</p>
        </div>

        <div className="p-6">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const stats = getTeamStats(team);
              const totalGames = stats.wins + stats.draws + stats.losses;

              return (
                <article
                  key={team._id}
                  className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-orange-300 hover:-translate-y-1"
                  onClick={() => openTeamModal(team)}
                >
                  {/* Header with team info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={team.profileImage}
                          alt={team.name}
                          className="w-12 h-12 object-cover rounded-full border-2 border-gray-200 group-hover:border-orange-300 transition-colors"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {stats.points}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors truncate">
                          {team.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <UsersIcon size={14} />
                          {team.players?.length || 0} jugadores
                        </p>
                      </div>
                    </div>
                    <TrophyIcon className="w-5 h-5 text-orange-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                      <div className="text-lg font-bold text-green-700">
                        {stats.wins}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Ganados
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                      <div className="text-lg font-bold text-yellow-700">
                        {stats.draws}
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">
                        Empates
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                      <div className="text-lg font-bold text-red-700">
                        {stats.losses}
                      </div>
                      <div className="text-xs text-red-600 font-medium">
                        Perdidos
                      </div>
                    </div>
                  </div>

                  {/* Goals and Performance */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-1">
                        <TargetIcon size={14} className="text-blue-500" />
                        <span className="font-medium text-gray-700">
                          {stats.goalsFor}
                        </span>
                        {/* <span className="text-gray-400">-</span>
                        <span className="font-medium text-gray-700">
                          {stats.goalsAgainst}
                        </span> */}
                      </div>
                      <div
                        className={`font-bold ${
                          stats.goalDifference >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stats.goalDifference >= 0 ? "+" : ""}
                        {stats.goalDifference}
                      </div>
                    </div>
                    <div className="text-gray-500">{totalGames} PJ</div>
                  </div>

                  {/* Progress bar for win rate */}
                  {totalGames > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Rendimiento</span>
                        <span>
                          {Math.round((stats.wins / totalGames) * 100)}% victorias
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(stats.wins / totalGames) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedTeam && (
          <div>
            <h2 className="text-xl font-bold mb-4">{selectedTeam.name}</h2>
            {playersLoading ? (
              <p>Cargando jugadores...</p>
            ) : playersError ? (
              <p className="text-red-600">{playersError}</p>
            ) : (
              <div>
                <h3 className="font-semibold mb-2">Jugadores:</h3>
                {selectedTeam.players && selectedTeam.players.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="py-1 pr-4 font-semibold">Jugador</th>
                          <th className="py-1 px-2">PJ</th>
                          <th className="py-1 px-2">G</th>
                          <th className="py-1 px-2">A</th>
                          <th className="py-1 px-2 text-yellow-600">TA</th>
                          <th className="py-1 px-2 text-red-600">TR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeam.players.map((player: Player | any) => {
                          const displayName =
                            player.name || player.userId?.name || "Sin nombre";
                          const s = player.stats || {};
                          return (
                            <tr
                              key={player._id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-1 pr-4 whitespace-nowrap font-medium text-gray-700">
                                {displayName}
                              </td>
                              <td className="py-1 px-2 text-center">
                                {s.matchesPlayed ?? "-"}
                              </td>
                              <td className="py-1 px-2 text-center">
                                {s.goals ?? "-"}
                              </td>
                              <td className="py-1 px-2 text-center">
                                {s.assists ?? "-"}
                              </td>
                              <td className="py-1 px-2 text-center text-yellow-600">
                                {s.yellowCards ?? "-"}
                              </td>
                              <td className="py-1 px-2 text-center text-red-600">
                                {s.redCards ?? "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No hay jugadores registrados</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
