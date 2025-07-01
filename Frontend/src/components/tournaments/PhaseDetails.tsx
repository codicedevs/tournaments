import React from "react";
import { Phase } from "../../models/Phase";
import { Tournament } from "../../models/Tournament";
import { Matchday } from "../../models/Matchday";

interface PhaseDetailsProps {
  phase: Phase;
  registrationsCount: number;
}

const PhaseDetails: React.FC<PhaseDetailsProps> = ({
  phase,
  registrationsCount,
}) => {
  // Obtener nombre de la liga
  const tournament =
    typeof phase.tournamentId === "object"
      ? (phase.tournamentId as Tournament)
      : undefined;
  const tournamentName = tournament?.name || "-";

  // Fechas hardcodeadas
  const startDate = "1/1/2025";
  const endDate = "31/12/2025";

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Detalles de la Fase
      </h2>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-16 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Liga
          </label>
          <p className="mt-1 text-sm text-gray-900">{tournamentName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Tipo
          </label>
          <p className="mt-1 text-sm text-gray-900">{phase?.type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Equipos Registrados
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {registrationsCount} equipos
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Fecha de inicio
          </label>
          <p className="mt-1 text-sm text-gray-900">{startDate}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Fecha de finalización
          </label>
          <p className="mt-1 text-sm text-gray-900">{endDate}</p>
        </div>
      </div>
    </div>
  );
};

export default PhaseDetails;
