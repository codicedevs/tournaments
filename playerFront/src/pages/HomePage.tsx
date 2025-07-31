import { useEffect, useState } from "react";
import { tournamentsApi, Tournament } from "../api/http";
import { PositionTable } from "../components/PositionTable";
import { TopScorers } from "../components/TopScorers";
import { NextMatches } from "../components/NextMatches";
import { WelcomeDivisionSelector } from "../components/WelcomeDivisionSelector";

export function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | undefined
  >();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    tournamentsApi
      .getAll()
      .then((data) => {
        setTournaments(data);
        // Preselect the first tournament so the page starts with data
        if (data.length > 0) {
          setSelectedTournamentId(data[0]._id);
        }
      })
      .catch(() =>
        setError("Ocurrió un error al obtener los torneos disponibles.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeDivisionSelector
        title="¡Bienvenido a Loyal League!"
        description="Sigue todos los partidos, resultados y estadísticas de tu división favorita"
        tournaments={tournaments}
        selectedTournamentId={selectedTournamentId ?? ""}
        onTournamentChange={(tournamentId) => 
          setSelectedTournamentId(tournamentId === "" ? undefined : tournamentId)
        }
        loading={loading}
        error={error}
      />

      {/* Content Sections */}
      <NextMatches tournamentId={selectedTournamentId} />
      <PositionTable tournamentId={selectedTournamentId} />
      {/* Tabla de goleadores */}
      <TopScorers tournamentId={selectedTournamentId} />
    </div>
  );
}
