import React from "react";

interface PlayersTableProps {
  registrations: any[]; // Cambia el tipo según tu modelo real si lo prefieres
}

const PlayersTable: React.FC<PlayersTableProps> = ({ registrations }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Tabla de Jugadores</h2>
      {/* Aquí va la lógica y renderizado de la tabla de jugadores */}
      <div className="text-gray-500 text-center py-8">
        Próximamente: ranking de jugadores.
      </div>
    </div>
  );
};

export default PlayersTable;
