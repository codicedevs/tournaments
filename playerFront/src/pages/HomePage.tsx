import { PlayerWelcomeBox } from "../components/PlayerWelcomeBox";
import { NextMatches } from "../components/NextMatches";
import { PositionTable } from "../components/PositionTable";
import { TopScorers } from "../components/TopScorers";
import { MobileNavigation } from "../components/MobileNavigation";

export function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen w-full pb-16 md:pb-0">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <PlayerWelcomeBox />
        <NextMatches />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PositionTable />
          <TopScorers />
        </div>
      </main>
      {/* Only visible on mobile */}
      <MobileNavigation />
    </div>
  );
}
