import { useEffect, useState } from "react";
import { matchesApi, Match } from "../api/http";
import { CalendarIcon, ClockIcon } from "lucide-react";

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchesApi.getAll();
        setMatches(data);
      } catch (err) {
        setError("Error fetching matches");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading)
    return <p className="px-4 py-8 text-center">Loading matches...</p>;
  if (error)
    return <p className="px-4 py-8 text-center text-red-600">{error}</p>;

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 max-w-3xl mx-auto">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
          <span className="w-1 h-6 bg-indigo-600 rounded mr-3"></span>
          All Matches
        </h2>
      </div>
      <div className="grid gap-4">
        {matches.map((match) => (
          <article
            key={match.id}
            className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center text-gray-500 text-sm mb-2">
              <div className="flex items-center gap-1">
                <CalendarIcon size={16} />
                <span>{new Date(match.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon size={16} />
                <span>
                  {new Date(match.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold flex-1 text-center truncate">
                {match.homeTeamId}
              </span>
              <span className="mx-3 font-bold text-gray-600">VS</span>
              <span className="font-semibold flex-1 text-center truncate">
                {match.awayTeamId}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
