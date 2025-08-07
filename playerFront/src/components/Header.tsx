import { NavLink } from "react-router-dom";
import LoyalLogo from "../assets/LoyalLeague2.png?url";

export function Header() {
  // const { user } = useApp();
  return (
    <header className="bg-black text-white w-full fixed top-0 left-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <img src={LoyalLogo} alt="Torneo Loyal" className="h-10 w-auto" />
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
            to="/fixture"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Fixture
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
          {/* <NavLink
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
            to="/account"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-white"
                : "text-white/80 hover:text-white"
            }
          >
            Mi cuenta
          </NavLink> */}
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
