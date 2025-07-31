import {
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { tournamentsApi, matchdaysApi, Match } from "../api/http";
import { useEffect, useRef, useState } from "react";

interface NextMatchesProps {
  tournamentId: string | undefined;
}

export function NextMatches({ tournamentId }: NextMatchesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
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
          .slice(0, 3);

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

  // ---------- Navigation helpers ----------
  const nextSlide = () =>
    setCurrentSlide((prev) =>
      Math.min(prev + 1, Math.max(matches.length - 1, 0))
    );

  const prevSlide = () =>
    setCurrentSlide((prev) => Math.max(prev - 1, 0));

  if (!tournamentId) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 text-center">
        Selecciona un torneo para ver los próximos partidos.
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 text-center">
        Cargando próximos partidos...
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black flex items-center">
          <span className="w-1 h-6 bg-black rounded mr-3"></span>
          Próximos partidos
        </h2>
      </div>
      <div className="relative">
        {/* Slider container */}
        <div className="overflow-hidden">
          <div
            className="transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            <div className="flex">
              {matches.map((match) => (
                <div key={match._id} className="min-w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarIcon size={16} />
                      <span>
                        {new Date(match.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
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
                    <div className="text-center flex-1">
                      <span className="font-bold text-lg">
                        {(match as any).teamA?.name ?? "Equipo A"}
                      </span>
                    </div>
                    <div className="px-4 py-2 mx-4 bg-gray-100 rounded-lg font-bold">
                      VS
                    </div>
                    <div className="text-center flex-1">
                      <span className="font-bold text-lg">
                        {(match as any).teamB?.name ?? "Equipo B"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-gray-500">
                    <span>Loyal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Navigation buttons */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-indigo-600 hover:bg-indigo-50 transition-colors"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          aria-label="Previous match"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-indigo-600 hover:bg-indigo-50 transition-colors"
          onClick={nextSlide}
          disabled={currentSlide === matches.length - 1}
          aria-label="Next match"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>
      {/* Pagination indicators */}
      <div className="flex justify-center gap-2 py-4">
        {matches.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === index ? "bg-indigo-600" : "bg-gray-300"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to match ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
