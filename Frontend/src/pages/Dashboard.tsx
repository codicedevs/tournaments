import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { TrophyIcon, UsersIcon, UserIcon, EyeIcon } from "lucide-react";
import PongGame from "./PongGame";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      title: "Divisiones",
      description: "Crear y gestionar divisiones",
      icon: <TrophyIcon size={28} />,
      primaryAction: () => navigate("/divisions"),
      secondaryAction: () => navigate("/divisions/new"),
      primaryLabel: "Ver Divisiones",
      secondaryLabel: "Crear División",
      bgImage:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-green-600/40 to-blue-700/40",
    },
    {
      title: "Equipos",
      description: "Crear y gestionar equipos",
      icon: <UsersIcon size={28} />,
      primaryAction: () => navigate("/teams"),
      secondaryAction: () => navigate("/teams/new"),
      primaryLabel: "Ver Equipos",
      secondaryLabel: "Crear Equipo",
      bgImage:
        "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-purple-600/40 to-pink-700/40",
    },
    {
      title: "Usuarios",
      description: "Crear y gestionar usuarios",
      icon: <UserIcon size={28} />,
      primaryAction: () => navigate("/users"),
      secondaryAction: () => navigate("/users/new"),
      primaryLabel: "Ver Usuarios",
      secondaryLabel: "Crear Usuario",
      bgImage:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-orange-600/40 to-red-700/40",
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto py-10 px-6">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-serif">
            Panel de Control
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Gestiona divisiones, equipos y jugadores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              {/* Imagen de fondo */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.bgImage})` }}
              />

              {/* Overlay oscuro para mejor contraste */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Overlay con gradiente */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}
              />

              {/* Contenido */}
              <div className="relative p-6 h-72 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl text-gray-800 border border-white/60 shadow-lg">
                      {item.icon}
                    </div>
                    <h2 className="ml-4 text-2xl font-bold text-white font-serif drop-shadow-lg">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-white text-base font-medium mb-6 leading-relaxed drop-shadow-md">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={item.primaryAction}
                    className="w-full py-3 px-4 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 font-bold text-sm rounded-xl border border-white/60 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {item.primaryLabel}
                  </button>
                  <button
                    onClick={item.secondaryAction}
                    className="w-full py-3 px-4 bg-white/80 backdrop-blur-sm hover:bg-white/95 text-gray-800 font-semibold text-sm rounded-xl border border-white/50 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {item.secondaryLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección especial para el veedor */}
        <div className="text-center">
          <div className="relative inline-block">
            <button
              onClick={() => navigate("/match/viewerFlow")}
              className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 border-2 border-white/20"
            >
              <div className="flex items-center gap-4">
                <EyeIcon size={24} className="group-hover:animate-pulse" />
                <span className="font-serif text-lg">
                  Ver Partidos por Veedor
                </span>
              </div>

              {/* Efecto de brillo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Badge de novedad */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                ¡NUEVO!
              </div>
            </button>
          </div>

          <p className="mt-4 text-gray-600 font-light text-base">
            Acceso especial para veedores y árbitros
          </p>
        </div>

        {/* <PongGame /> */}
      </main>
    </div>
  );
};
export default Dashboard;
