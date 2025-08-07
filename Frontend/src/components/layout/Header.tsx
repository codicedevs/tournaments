import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  LogOutIcon,
  SettingsIcon,
  TrophyIcon,
  UserRound,
  ShieldIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  VolleyballIcon,
} from "lucide-react";
import MobileNavigation from "./MobileNavigation";

const Header: React.FC = () => {
  const { logout, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleChangePassword = () => {
    navigate("/change-password", { state: { isFirstLogin: false } });
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Don't show navigation in login page or change password page
  if (
    location.pathname === "/login" ||
    location.pathname === "/change-password"
  ) {
    return null;
  }

  return (
    <>
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo y título */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-lg md:text-xl font-bold flex items-center gap-2 hover:text-blue-100 transition"
            >
              <VolleyballIcon size={30} className="md:w-9 md:h-9" />
              <span className="hidden sm:inline">Sistema de Torneos</span>
              <span className="sm:hidden">Sistema</span>
            </Link>
          </div>

          {/* Menú de navegación - Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              to="/divisions"
              className={`flex items-center gap-1 px-3 py-2 rounded transition ${
                location.pathname.startsWith("/divisions")
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <TrophyIcon size={28} />
              <span>Divisiones</span>
            </Link>

            <Link
              to="/teams"
              className={`flex items-center gap-1 px-3 py-2 rounded transition ${
                location.pathname.startsWith("/teams")
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <ShieldIcon size={28} />
              <span>Equipos</span>
            </Link>

            <Link
              to="/users"
              className={`flex items-center gap-1 px-3 py-2 rounded transition ${
                location.pathname.startsWith("/users")
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <UserRound size={28} />
              <span>Usuarios</span>
            </Link>
          </nav>

          {/* Información del usuario y controles - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm">
                <span>{user.name}</span>
                <span className="text-blue-200">({user.role})</span>
              </div>
            )}

            {/* Dropdown menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 p-2 rounded transition"
              >
                <SettingsIcon size={16} />
                <ChevronDownIcon
                  size={12}
                  className={`transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <SettingsIcon size={16} />
                    <span>Cambiar Contraseña</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <LogOutIcon size={16} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="text-sm">
                <span className="text-blue-200">({user.role})</span>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 p-2 rounded transition"
            >
              {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-blue-500">
            <nav className="flex flex-col gap-2 mt-4">
              <Link
                to="/divisions"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded transition ${
                  location.pathname.startsWith("/divisions")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <TrophyIcon size={18} />
                <span>Divisiones</span>
              </Link>

              <Link
                to="/teams"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded transition ${
                  location.pathname.startsWith("/teams")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <ShieldIcon size={18} />
                <span>Equipos</span>
              </Link>

              <Link
                to="/users"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded transition ${
                  location.pathname.startsWith("/users")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <UserRound size={18} />
                <span>Usuarios</span>
              </Link>

              <div className="border-t border-blue-500 pt-4 mt-2">
                {user && (
                  <div className="px-4 py-2 text-sm text-blue-200">
                    <span>{user.name}</span>
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left text-blue-100 hover:bg-blue-700 hover:text-white transition"
                >
                  <SettingsIcon size={18} />
                  <span>Cambiar Contraseña</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left text-blue-100 hover:bg-blue-700 hover:text-white transition"
                >
                  <LogOutIcon size={18} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
      <MobileNavigation />
    </>
  );
};

export default Header;
