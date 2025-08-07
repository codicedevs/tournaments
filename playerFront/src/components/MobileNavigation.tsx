import {
  HomeIcon,
  LayersIcon,
  CalendarIcon,
  UserIcon,
  Shield,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black md:hidden z-10">
      <div className="grid grid-cols-3 h-16">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive ? "text-white" : "text-gray-400 hover:text-indigo-600"
            }`
          }
        >
          <HomeIcon size={24} />
          <span className="text-xs font-medium">Inicio</span>
        </NavLink>

        <NavLink
          to="/fixture"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive ? "text-white" : "text-gray-400 hover:text-indigo-600"
            }`
          }
        >
          <CalendarIcon size={24} />
          <span className="text-xs font-medium">Fixture</span>
        </NavLink>

        <NavLink
          to="/teams"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive ? "text-white" : "text-gray-400 hover:text-indigo-600"
            }`
          }
        >
          <Shield size={24} />
          <span className="text-xs font-medium">Equipos</span>
        </NavLink>

        {/* <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 ${
              isActive ? "text-white" : "text-gray-400 hover:text-indigo-600"
            }`
          }
        >
          <UserIcon size={24} />
          <span className="text-xs font-medium">Account</span>
        </NavLink> */}
      </div>
    </nav>
  );
}
