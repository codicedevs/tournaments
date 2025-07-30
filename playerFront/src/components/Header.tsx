import { UserIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
// import loyalLogo from "../assets/loyal_logo.jpg";

export function Header() {
  const { user } = useApp();
  return (
    <header className="bg-indigo-600 text-white w-full">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Torneo Loyal</h1>
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
            Inicio
          </NavLink>
          <NavLink
            to="/divisions"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Divisiones
          </NavLink>
          <NavLink
            to="/matches"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Partidos
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Equipos
          </NavLink>
          <NavLink
            to="/account"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Mi cuenta
          </NavLink>
        </nav>

        {/* {user && (
          <div className="flex items-center gap-2">
            <span>Bienvenido, {user.name}</span>
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="bg-indigo-700 p-2 rounded-full">
                <UserIcon size={18} />
              </div>
            )}
          </div>
        )} */}
      </div>
    </header>
  );
}
