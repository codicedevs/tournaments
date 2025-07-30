import {
  TrophyIcon,
  GoalIcon,
  AlertTriangleIcon,
  CalendarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { api, Player, Match } from "../api/http";

export function PlayerWelcomeBox() {
  const { user } = useApp();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!user?.id) return;
      try {
        const data = await api.players.getByUserId(user.id);
        setPlayer(data[0] ?? null);
      } catch (_err) {
        setError("Error fetching player data");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [user?.id]);

  // Fetch next match once we have the player (and therefore teamId)
  useEffect(() => {
    const fetchNext = async () => {
      if (!player?.teamId?._id) return;
      try {
        const matches = await api.matches.findByTeam(player.teamId._id);
        const upcoming = matches
          .filter((m) => new Date(m.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setNextMatch(upcoming[0] ?? null);
      } catch (e) {
        // ignore silently
      }
    };
    fetchNext();
  }, [player?.teamId?._id]);

  if (loading) return <p className="p-4 text-center">Loading player...</p>;
  if (error) return <p className="p-4 text-center text-red-600">{error}</p>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-indigo-600 px-6 py-3">
        <h2 className="text-white text-sm font-medium uppercase tracking-wider">
          DIVISION 1
        </h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Player info */}
          <div className="flex items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold mr-4">
              CR
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.name}</h3>
              <p className="text-gray-600">{player?.teamId?.name ?? "N/A"}</p>
            </div>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <GoalIcon size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Goals</p>
                <p className="font-bold">{player?.stats?.goals ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangleIcon size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Red Cards</p>
                <p className="font-bold">{player?.stats?.redCards ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrophyIcon size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Jugados</p>
                <p className="font-bold">{player?.stats?.matchesPlayed}</p>
              </div>
            </div>
          </div>
          {/* Next match section */}
          {nextMatch && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
              <CalendarIcon size={16} />
              <span>
                Próximo partido: {new Date(nextMatch.date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })} vs {
                  // Mostrar rival
                  nextMatch.teamA._id === player!.teamId!._id
                  ? (nextMatch as any).teamB?.name ?? "Rival"
                  : (nextMatch as any).teamA?.name ?? "Rival"
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
