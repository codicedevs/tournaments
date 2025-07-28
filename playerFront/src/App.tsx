import { Header } from "./components/Header";
import { MobileNavigation } from "./components/MobileNavigation";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DivisionsPage } from "./pages/DivisionsPage";
import { MatchesPage } from "./pages/MatchesPage";
import { AccountPage } from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

export function App() {
  return (
    <div className="bg-gray-50 min-h-screen w-full pb-16 md:pb-0">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/divisions" element={<DivisionsPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <MobileNavigation />
    </div>
  );
}
