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

  // Fecha de inicio: usar createdAt del documento
  const startDate = phase.createdAt
    ? new Date(phase.createdAt).toLocaleDateString()
    : "-";

  return (
    <div className="bg-white p-8 w-full">
      <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-2">
        Detalles de la Fase
      </h2>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-16 gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Liga
          </label>
          <p className="mt-1 text-lg text-gray-900 font-semibold">
            {tournamentName}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tipo
          </label>
          <p className="mt-1 text-base text-gray-700 font-normal">
            {phase?.type}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Equipos Registrados
          </label>
          <p className="mt-1 text-base text-gray-700 font-normal">
            {registrationsCount} equipos
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha de inicio
          </label>
          <p className="mt-1 text-base text-gray-700 font-normal">
            {startDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhaseDetails;
