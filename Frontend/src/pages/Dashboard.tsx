import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { TrophyIcon, UsersIcon, UserIcon } from "lucide-react";
import PongGame from "./PongGame";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      title: "Divisiones",
      description: "Crear y gestionar divisiones",
      icon: <TrophyIcon size={24} />,
      primaryAction: () => navigate("/divisions"),
      secondaryAction: () => navigate("/divisions/new"),
      primaryLabel: "Ver Divisiones",
      secondaryLabel: "Crear División",
    },
    {
      title: "Equipos",
      description: "Crear y gestionar equipos",
      icon: <UsersIcon size={24} />,
      primaryAction: () => navigate("/teams"),
      secondaryAction: () => navigate("/teams/new"),
      primaryLabel: "Ver Equipos",
      secondaryLabel: "Crear Equipo",
    },
    {
      title: "Usuarios",
      description: "Crear y gestionar usuarios",
      icon: <UserIcon size={24} />,
      primaryAction: () => navigate("/users"),
      secondaryAction: () => navigate("/users/new"),
      primaryLabel: "Ver Usuarios",
      secondaryLabel: "Crear Usuario",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-600">Gestiona torneos, equipos y jugadores</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    {item.icon}
                  </div>
                  <h2 className="ml-3 text-lg font-semibold text-gray-800">
                    {item.title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={item.primaryAction}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                  >
                    {item.primaryLabel}
                  </button>
                  <button
                    onClick={item.secondaryAction}
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                  >
                    {item.secondaryLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/match/viewerFlow")}
              className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition text-lg"
            >
              Ver partidos por veedor
            </button>
          </div>
          <br />
          {/* <PongGame /> */}
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
