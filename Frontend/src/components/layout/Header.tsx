import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { LogOutIcon, HomeIcon, SettingsIcon } from "lucide-react";

const Header: React.FC = () => {
  const { logout, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password", { state: { isFirstLogin: false } });
  };

  // Don't show navigation in login page or change password page
  if (
    location.pathname === "/login" ||
    location.pathname === "/change-password"
  ) {
    return null;
  }

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-xl font-bold flex items-center gap-2 hover:text-blue-100 transition"
          >
            <HomeIcon size={24} />
            <span>Sistema de Torneos</span>
          </Link>
          {location.pathname !== "/dashboard" && (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition"
            >
              Volver al Panel
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <span>{user.name}</span>
              <span className="text-blue-200">({user.role})</span>
            </div>
          )}
          <button
            onClick={handleChangePassword}
            className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition"
          >
            <SettingsIcon size={16} />
            <span>Cambiar Contraseña</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition"
          >
            <LogOutIcon size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
