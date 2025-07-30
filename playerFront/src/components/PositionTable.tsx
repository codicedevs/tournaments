export function PositionTable() {
  const teams = [
    {
      id: 1,
      position: 1,
      name: "Lightning United",
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      points: 25,
    },
    {
      id: 2,
      position: 2,
      name: "Thunder FC",
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      points: 23,
    },
    {
      id: 3,
      position: 3,
      name: "River Plate",
      played: 10,
      won: 6,
      drawn: 2,
      lost: 2,
      points: 20,
    },
    {
      id: 4,
      position: 4,
      name: "Mountain Lions",
      played: 10,
      won: 5,
      drawn: 3,
      lost: 2,
      points: 18,
    },
    {
      id: 5,
      position: 5,
      name: "Eagles FC",
      played: 10,
      won: 5,
      drawn: 1,
      lost: 4,
      points: 16,
    },
    {
      id: 6,
      position: 6,
      name: "Royal Knights",
      played: 10,
      won: 4,
      drawn: 2,
      lost: 4,
      points: 14,
    },
    {
      id: 7,
      position: 7,
      name: "City Warriors",
      played: 10,
      won: 3,
      drawn: 2,
      lost: 5,
      points: 11,
    },
    {
      id: 8,
      position: 8,
      name: "United Stars",
      played: 10,
      won: 2,
      drawn: 3,
      lost: 5,
      points: 9,
    },
  ];
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
          <span className="w-1 h-6 bg-indigo-600 rounded mr-3"></span>
          Tabla de posiciones
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-gray-500">#</th>
              <th className="px-6 py-3 text-gray-500">Team</th>
              <th className="px-6 py-3 text-gray-500 text-center">P</th>
              <th className="px-6 py-3 text-gray-500 text-center">W</th>
              <th className="px-6 py-3 text-gray-500 text-center">D</th>
              <th className="px-6 py-3 text-gray-500 text-center">L</th>
              <th className="px-6 py-3 text-gray-500 text-center">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teams.map((team) => (
              <tr
                key={team.id}
                className={team.name === "Thunder FC" ? "bg-indigo-50" : ""}
              >
                <td className="px-6 py-4">{team.position}</td>
                <td className="px-6 py-4 font-medium">{team.name}</td>
                <td className="px-6 py-4 text-center">{team.played}</td>
                <td className="px-6 py-4 text-center">{team.won}</td>
                <td className="px-6 py-4 text-center">{team.drawn}</td>
                <td className="px-6 py-4 text-center">{team.lost}</td>
                <td className="px-6 py-4 text-center font-bold">
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
