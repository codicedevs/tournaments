import { UserIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-indigo-600 text-white w-full">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Tournament Central</h1>
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/divisions"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Divisions
          </NavLink>
          <NavLink
            to="/matches"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Matches
          </NavLink>
          <NavLink
            to="/account"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Account
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <span>Welcome, Player</span>
          <div className="bg-indigo-700 p-2 rounded-full">
            <UserIcon size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
