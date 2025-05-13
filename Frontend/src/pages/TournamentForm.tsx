import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/layout/Header';
import { ArrowLeftIcon } from 'lucide-react';
const TournamentForm: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const {
    addTournament
  } = useApp();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('El nombre del torneo es requerido');
      return;
    }
    addTournament(name.trim());
    navigate('/tournaments');
  };
  return <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button onClick={() => navigate('/tournaments')} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeftIcon size={16} />
          <span>Volver a Torneos</span>
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Crear Nuevo Torneo</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Torneo
              </label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ingrese el nombre del torneo" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => navigate('/tournaments')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>;
};
export default TournamentForm;