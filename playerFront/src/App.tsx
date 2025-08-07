import { Header } from "./components/Header";
import { MobileNavigation } from "./components/MobileNavigation";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DivisionsPage } from "./pages/DivisionsPage";
import { FixturesPage } from "./pages/FixturesPage";
import { TeamsPage } from "./pages/TeamsPage";

export function App() {
  return (
    <div className="bg-gray-50 min-h-screen w-full pb-16 md:pb-0">
      <Header />
      {/* Added extra top padding to avoid content being hidden behind the fixed header */}
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-6 space-y-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/divisions" element={<DivisionsPage />} />
          <Route path="/fixture" element={<FixturesPage />} />
          <Route path="/teams" element={<TeamsPage />} />

          {/* <Route path="/account" element={<AccountPage />} /> */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
        </Routes>
      </main>
      <MobileNavigation />
    </div>
  );
}
