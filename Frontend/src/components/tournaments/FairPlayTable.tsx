import React from "react";
import { Registration } from "../../models/Registration";

interface FairPlayTableProps {
  registrations: Registration[];
}

const FairPlayTable: React.FC<FairPlayTableProps> = ({ registrations }) => {
  // Ordenar por la suma de tarjetas (amarillas + azules + rojas)
  const sorted = [...registrations].sort((a, b) => {
    const taA =
      (a.stats?.yellowCards || 0) +
      (a.stats?.blueCards || 0) +
      (a.stats?.redCards || 0);
    const taB =
      (b.stats?.yellowCards || 0) +
      (b.stats?.blueCards || 0) +
      (b.stats?.redCards || 0);
    return taA - taB;
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold text-center mb-4">Tabla Fair Play</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-[300px] text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="text-yellow-500">🟨</span>
              </th>
              <th className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="text-blue-500">🟦</span>
              </th>
              <th className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="text-red-500">🟥</span>
              </th>
              <th className="px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PJE
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map((registration) => {
              const team =
                typeof registration.teamId === "string"
                  ? { _id: registration.teamId, name: "Equipo Desconocido" }
                  : registration.teamId;
              const yellow = registration.stats?.yellowCards || 0;
              const blue = registration.stats?.blueCards || 0;
              const red = registration.stats?.redCards || 0;
              const total = yellow + blue + red;
              return (
                <tr key={team._id}>
                  {/* <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {team.name}
                  </td> */}
                  <td className="px-1 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                    {yellow}
                  </td>
                  <td className="px-1 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                    {blue}
                  </td>
                  <td className="px-1 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                    {red}
                  </td>
                  <td className="px-1 py-2 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                    {total}
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

export default FairPlayTable;
