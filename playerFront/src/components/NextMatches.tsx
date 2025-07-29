import React, { useState, useRef, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api, Player, Match } from "../api/http";

export function NextMatches() {
  const { user } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch player's team & upcoming matches
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const players = await api.players.getByUserId(user.id);
        const player: Player | undefined = players[0];
        if (!player?.teamId?.id) return;

        const all = await api.matches.findByTeam(player.teamId.id);
        const upcoming = all
          .filter((m) => new Date(m.date) > new Date())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 3);
        setMatches(upcoming);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 text-center">
        Cargando próximos partidos...
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 text-center">
        No hay partidos programados
      </section>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === matches.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? matches.length - 1 : prev - 1));
  };
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
          <span className="w-1 h-6 bg-indigo-600 rounded mr-3"></span>
          Next Matches
        </h2>
      </div>
      <div className="relative">
        {/* Slider container */}
        <div
          ref={sliderRef}
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            <div className="flex">
              {matches.map((match) => (
                <div key={match.id} className="min-w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarIcon size={16} />
                      <span>{new Date(match.date).toLocaleDateString()}</span>
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
          aria-label="Previous match"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-indigo-600 hover:bg-indigo-50 transition-colors"
          onClick={nextSlide}
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
            onClick={() => goToSlide(index)}
            aria-label={`Go to match ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
