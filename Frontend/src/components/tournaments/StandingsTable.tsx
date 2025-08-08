import React from "react";
import { Registration } from "../../models/Registration";

interface StandingsTableProps {
  registrations: Registration[];
}

const StandingsTable: React.FC<StandingsTableProps> = ({ registrations }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Tabla de Posiciones</h2>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PJ
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                G
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                E
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                P
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GF
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GC
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                DG
              </th>
              <th className="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pts
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((registration) => {
              const wins = registration.stats?.wins || 0;
              const draws = registration.stats?.draws || 0;
              const losses = registration.stats?.losses || 0;
              const goalsFor = registration.stats?.goalsFor || 0;
              const goalsAgainst = registration.stats?.goalsAgainst || 0;
              const played = wins + draws + losses;
              const points = wins * 3 + draws;
              const goalDiff = goalsFor - goalsAgainst;

              const teamIdVal =
                typeof registration.teamId === "string"
                  ? registration.teamId
                  : registration.teamId?._id;
              const teamName =
                typeof registration.teamId === "string"
                  ? "Equipo Desconocido"
                  : registration.teamId?.name || "Sin equipo";

              return (
                <tr key={teamIdVal || registration._id}>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 max-w-[140px] truncate">
                    {teamName}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                    {played}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                    {wins}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                    {draws}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                    {losses}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                    {goalsFor}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                    {goalsAgainst}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                    {goalDiff}
                  </td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center font-medium text-gray-900">
                    {points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTable;
