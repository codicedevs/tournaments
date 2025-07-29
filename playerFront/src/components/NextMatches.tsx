import React, { useState, useRef } from "react";
import {
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
export function NextMatches() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const matches = [
    {
      id: 1,
      date: "Oct 15, 2023",
      time: "14:30",
      homeTeam: "Thunder FC",
      awayTeam: "Lightning United",
      location: "East Field Stadium",
    },
    {
      id: 2,
      date: "Oct 22, 2023",
      time: "16:00",
      homeTeam: "River Plate",
      awayTeam: "Thunder FC",
      location: "River Stadium",
    },
    {
      id: 3,
      date: "Oct 29, 2023",
      time: "15:00",
      homeTeam: "Thunder FC",
      awayTeam: "Mountain Lions",
      location: "East Field Stadium",
    },
  ];
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
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <ClockIcon size={16} />
                      <span>{match.time}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <span className="font-bold text-lg">
                        {match.homeTeam}
                      </span>
                    </div>
                    <div className="px-4 py-2 mx-4 bg-gray-100 rounded-lg font-bold">
                      VS
                    </div>
                    <div className="text-center flex-1">
                      <span className="font-bold text-lg">
                        {match.awayTeam}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-gray-500">
                    <span>{match.location}</span>
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
