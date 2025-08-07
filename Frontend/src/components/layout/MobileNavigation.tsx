import React from "react";
import { Link, useLocation } from "react-router-dom";
import { TrophyIcon, ShieldIcon, UserRound } from "lucide-react";

const MobileNavigation: React.FC = () => {
  const location = useLocation();

  const baseClasses = "flex flex-col items-center justify-center flex-1 py-2 transition";

  const linkClasses = (pathPrefix: string) =>
    location.pathname.startsWith(pathPrefix)
      ? `${baseClasses} text-white`
      : `${baseClasses} text-blue-300 hover:text-white`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex bg-blue-600 shadow-inner md:hidden">
      <Link to="/divisions" className={linkClasses("/divisions")}>
        <TrophyIcon size={22} />
        <span className="text-xs mt-1">Divisiones</span>
      </Link>
      <Link to="/teams" className={linkClasses("/teams")}>
        <ShieldIcon size={22} />
        <span className="text-xs mt-1">Equipos</span>
      </Link>
      <Link to="/users" className={linkClasses("/users")}>
        <UserRound size={22} />
        <span className="text-xs mt-1">Usuarios</span>
      </Link>
    </nav>
  );
};

export default MobileNavigation;
