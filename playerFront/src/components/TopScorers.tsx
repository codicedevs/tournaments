export function TopScorers() {
  const scorers = [
    {
      id: 1,
      position: 1,
      name: "Alex Johnson",
      team: "Lightning United",
      goals: 12,
    },
    {
      id: 2,
      position: 2,
      name: "Carlos Rodriguez",
      team: "Thunder FC",
      goals: 10,
    },
    {
      id: 3,
      position: 3,
      name: "Marco Silva",
      team: "River Plate",
      goals: 9,
    },
    {
      id: 4,
      position: 4,
      name: "David Lee",
      team: "Thunder FC",
      goals: 8,
    },
    {
      id: 5,
      position: 5,
      name: "James Wilson",
      team: "Mountain Lions",
      goals: 7,
    },
    {
      id: 6,
      position: 6,
      name: "Robert Garcia",
      team: "Eagles FC",
      goals: 6,
    },
    {
      id: 7,
      position: 7,
      name: "Michael Brown",
      team: "Royal Knights",
      goals: 5,
    },
    {
      id: 8,
      position: 8,
      name: "Thomas White",
      team: "City Warriors",
      goals: 5,
    },
  ];
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
          <span className="w-1 h-6 bg-indigo-600 rounded mr-3"></span>
          Top Scorers
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-gray-500">#</th>
              <th className="px-6 py-3 text-gray-500">Player</th>
              <th className="px-6 py-3 text-gray-500">Team</th>
              <th className="px-6 py-3 text-gray-500 text-center">Goals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scorers.map((scorer) => (
              <tr
                key={scorer.id}
                className={scorer.team === "Thunder FC" ? "bg-indigo-50" : ""}
              >
                <td className="px-6 py-4">{scorer.position}</td>
                <td className="px-6 py-4 font-medium">{scorer.name}</td>
                <td className="px-6 py-4">{scorer.team}</td>
                <td className="px-6 py-4 text-center font-bold">
                  {scorer.goals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
