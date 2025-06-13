import React from "react";
import { Registration } from "../../models/Registration";
import { Team } from "../../models/Team";

interface StandingsTableProps {
  registrations: Registration[];
}

const StandingsTable: React.FC<StandingsTableProps> = ({ registrations }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Tabla de Posiciones
      </h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Equipo
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              PJ
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              G
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              E
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              P
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              GF
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              GC
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              DG
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="flex items-center justify-center gap-1">
                <span className="text-yellow-500">🟨</span>
                <span>TA</span>
              </span>
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="flex items-center justify-center gap-1">
                <span className="text-blue-500">🟦</span>
                <span>TAz</span>
              </span>
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="flex items-center justify-center gap-1">
                <span className="text-red-500">🟥</span>
                <span>TR</span>
              </span>
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pts
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {registrations.map((registration) => {
            const teamStats = registration.stats;
            const stats = {
              wins: teamStats.wins || 0,
              draws: teamStats.draws || 0,
              losses: teamStats.losses || 0,
              goalsFor: teamStats.goalsFor || 0,
              goalsAgainst: teamStats.goalsAgainst || 0,
              yellowCards: teamStats.yellowCards || 0,
              blueCards: teamStats.blueCards || 0,
              redCards: teamStats.redCards || 0,
            };
            const played = stats.wins + stats.draws + stats.losses;
            const points = stats.wins * 3 + stats.draws;
            const goalDiff = stats.goalsFor - stats.goalsAgainst;

            const team =
              typeof registration.teamId === "string"
                ? { _id: registration.teamId, name: "Equipo Desconocido" }
                : registration.teamId;

            return (
              <tr key={team._id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {team.name}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {played}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.wins}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.draws}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.losses}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.goalsFor}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.goalsAgainst}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {goalDiff}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.yellowCards}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.blueCards}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {stats.redCards}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                  {points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
