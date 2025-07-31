import { HomeIcon, LayersIcon, CalendarIcon, UserIcon, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

export function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
      <div className="grid grid-cols-4 h-16">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive
                ? "text-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`
          }
        >
          <HomeIcon size={20} />
          <span className="text-xs font-medium">Inicio</span>
        </NavLink>

        <NavLink
          to="/fixture"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive
                ? "text-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`
          }
        >
          <CalendarIcon size={20} />
          <span className="text-xs font-medium">Fixture</span>
        </NavLink>

        <NavLink
          to="/teams"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive
                ? "text-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`
          }
        >
          <Shield size={20} />
          <span className="text-xs font-medium">Equipos</span>
        </NavLink>

        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive
                ? "text-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`
          }
        >
          <UserIcon size={20} />
          <span className="text-xs font-medium">Account</span>
        </NavLink>
      </div>
    </nav>
  );
}
