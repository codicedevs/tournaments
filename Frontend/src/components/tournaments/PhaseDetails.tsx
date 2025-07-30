import React from "react";
import { Phase } from "../../models/Phase";
import { Tournament } from "../../models/Tournament";
import { Matchday } from "../../models/Matchday";

interface PhaseDetailsProps {
  phase: Phase;
  registrationsCount: number;
  matchdays?: Matchday[];
}

const PhaseDetails: React.FC<PhaseDetailsProps> = ({
  phase,
  registrationsCount,
  matchdays = [],
}) => {
  // Obtener nombre de la liga
  const tournament =
    typeof phase.tournamentId === "object"
      ? (phase.tournamentId as Tournament)
      : undefined;
  const tournamentName = tournament?.name || "-";

  // Calcular fecha de inicio basada en el primer matchday o match
  const calculateStartDate = () => {
    if (matchdays.length === 0) {
      return {
        date: phase.createdAt
          ? new Date(phase.createdAt).toLocaleDateString()
          : "-",
        type: "Fase creada",
        description: "Fecha de creación de la fase",
      };
    }

    // Ordenar matchdays por orden
    const sortedMatchdays = [...matchdays].sort((a, b) => a.order - b.order);
    const firstMatchday = sortedMatchdays[0];

    if (firstMatchday.matches && firstMatchday.matches.length > 0) {
      // Si hay matches, usar la fecha del primer match
      const sortedMatches = firstMatchday.matches.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstMatch = sortedMatches[0];
      return {
        date: new Date(firstMatch.date).toLocaleDateString(),
        type: "Primer partido",
        description: `fecha ${firstMatchday.order}`,
      };
    } else if (firstMatchday.date) {
      // Si no hay matches pero hay fecha del matchday
      return {
        date: new Date(firstMatchday.date).toLocaleDateString(),
        type: "Jornada programada",
        description: `Fecha ${firstMatchday.order}`,
      };
    } else {
      // Fallback a la fecha de creación de la fase
      return {
        date: phase.createdAt
          ? new Date(phase.createdAt).toLocaleDateString()
          : "-",
        type: "Fase creada",
        description: "Fecha de creación de la fase",
      };
    }
  };

  const startDateInfo = calculateStartDate();

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
          <p className="text-xs text-gray-500 mt-1">
            {matchdays.length > 0
              ? `${matchdays.length} fecha${
                  matchdays.length !== 1 ? "s" : ""
                } configurada${matchdays.length !== 1 ? "s" : ""}`
              : "Sin fechas configuradas"}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Equipos Registrados
          </label>
          <p className="mt-1 text-base text-gray-700 font-normal">
            {registrationsCount} equipo{registrationsCount !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {registrationsCount > 0
              ? 'Haz clic en "Administrar Equipos" para gestionar'
              : "No hay equipos registrados aún"}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha de inicio
          </label>
          <p className="mt-1 text-base text-gray-700 font-normal">
            {startDateInfo.date}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {startDateInfo.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhaseDetails;
