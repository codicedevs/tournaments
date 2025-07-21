import React from "react";
import { Registration } from "../../models/Registration";

interface BestDefenseTableProps {
  registrations: Registration[];
}

const BestDefenseTable: React.FC<BestDefenseTableProps> = ({
  registrations,
}) => {
  // Ordenar por goles en contra (menor a mayor)
  const sorted = [...registrations].sort((a, b) => {
    const gaA = a.stats?.goalsAgainst || 0;
    const gaB = b.stats?.goalsAgainst || 0;
    return gaA - gaB;
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Valla Menos Vencida</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-[400px] text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Goles en Contra
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map((registration) => {
              const team =
                typeof registration.teamId === "string"
                  ? { _id: registration.teamId, name: "Equipo Desconocido" }
                  : registration.teamId;
              const goalsAgainst = registration.stats?.goalsAgainst || 0;
              return (
                <tr key={team._id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {team.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                    {goalsAgainst}
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

export default BestDefenseTable;
