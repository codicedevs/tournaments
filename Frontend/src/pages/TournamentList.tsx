import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/layout/Header';
import { PlusIcon, ArrowLeftIcon } from 'lucide-react';
const TournamentList: React.FC = () => {
  const {
    tournaments
  } = useApp();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
            <ArrowLeftIcon size={16} />
            <span>Volver al Panel</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Torneos</h1>
            <p className="text-gray-600">Gestiona los torneos disponibles</p>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Torneos</h1>
            <p className="text-gray-600">Gestiona los torneos disponibles</p>
          </div>
          <button onClick={() => navigate('/tournaments/new')} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
            <PlusIcon size={18} />
            <span>Crear Torneo</span>
          </button>
        </div>
        {tournaments.length === 0 ? <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No hay torneos disponibles.</p>
            <button onClick={() => navigate('/tournaments/new')} className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">
              <PlusIcon size={18} />
              <span>Crear Primer Torneo</span>
            </button>
          </div> : <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournaments.map(tournament => <tr key={tournament.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tournament.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tournament.name}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </main>
    </div>;
};
export default TournamentList;