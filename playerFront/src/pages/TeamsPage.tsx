import { useEffect, useState } from "react";
import {
  teamsApi,
  Team,
  Player,
  registrationApi,
  tournamentsApi,
  Tournament,
} from "../api/http";
import { Modal } from "../components/Modal";
import { WelcomeDivisionSelector } from "../components/WelcomeDivisionSelector";

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
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
        setTeams(tournamentTeams);
      } catch {
        setError("Error fetching teams");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [selectedTournamentId]);

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

  if (loading) {
    return <p className="px-4 py-8 text-center">Cargando equipos...</p>;
  }

  if (error) {
    return <p className="px-4 py-8 text-center text-red-600">{error}</p>;
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
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 max-w-4xl mx-auto">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-black flex items-center">
            <span className="w-1 h-6 bg-black rounded mr-3"></span>
            Equipos de la division
          </h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <article
              key={team._id}
              className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openTeamModal(team)}
            >
              <h3 className="font-semibold text-lg mb-1 truncate">
                {team.name}
              </h3>
              <br />
              <img
                src={team.profileImage}
                alt={team.name}
                className="w-16 h-16 object-cover rounded-full"
              />
            </article>
          ))}
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
                  <ul className="space-y-1">
                    {selectedTeam.players.map((player: Player) => (
                      <li key={player._id} className="text-gray-700">
                        {player.name}
                      </li>
                    ))}
                  </ul>
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
