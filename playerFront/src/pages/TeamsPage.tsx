import { useEffect, useState } from "react";
import { teamsApi, Team, Player } from "../api/http";
import { Modal } from "../components/Modal";

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamsApi.getAll();
        setTeams(data);
      } catch (err) {
        setError("Error fetching teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const openTeamModal = async (team: Team) => {
    setPlayersError(null);
    if (!team.players) {
      try {
        setPlayersLoading(true);
        const players = await teamsApi.players(team._id);
        team.players = players;
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

  console.log(teams);
  if (loading) {
    return <p className="px-4 py-8 text-center">Loading teams...</p>;
  }

  if (error) {
    return <p className="px-4 py-8 text-center text-red-600">{error}</p>;
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 max-w-4xl mx-auto">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
          <span className="w-1 h-6 bg-indigo-600 rounded mr-3"></span>
          Equipos del torneo
        </h2>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <article
            key={team._id}
            className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openTeamModal(team)}
          >
            <h3 className="font-semibold text-lg mb-1 truncate">{team.name}</h3>
            <p className="text-sm text-gray-500">Division: {team.division}</p>
            <br />
            <img
              src={team.profileImage}
              alt={team.name}
              className="w-16 h-16 object-cover rounded-full"
            />
          </article>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Jugadores de ${selectedTeam?.name}`}
      >
        {playersLoading && <p>Cargando jugadores...</p>}
        {playersError && <p className="text-red-600">{playersError}</p>}
        {!playersLoading && !playersError && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Goles</th>
                  <th className="px-4 py-2 border">Asistencias</th>
                  <th className="px-4 py-2 border">Amarillas</th>
                  <th className="px-4 py-2 border">Azules</th>
                  <th className="px-4 py-2 border">Rojas</th>
                  <th className="px-4 py-2 border">PJ</th>
                </tr>
              </thead>
              <tbody>
                {selectedTeam?.players?.map((player: any) => {
                  const stats = player.stats || {};
                  const playerName = player.name || player.userId?.name || "-";
                  return (
                    <tr key={player._id || player.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{playerName}</td>
                      <td className="px-4 py-2 border">{stats.goals ?? 0}</td>
                      <td className="px-4 py-2 border">{stats.assists ?? 0}</td>
                      <td className="px-4 py-2 border">{stats.yellowCards ?? 0}</td>
                      <td className="px-4 py-2 border">{stats.blueCards ?? 0}</td>
                      <td className="px-4 py-2 border">{stats.redCards ?? 0}</td>
                      <td className="px-4 py-2 border">{stats.matchesPlayed ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </section>
  );
}
