import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { ArrowLeftIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// You need to implement useCreateTeam in your api/userHooks.ts
import { useCreateTeam } from '../api/userHooks';

const teamSchema = z.object({
  name: z.string().min(1, 'El nombre del equipo es requerido'),
  coach: z.string().optional(),
  profileImage: z.string().optional(),
  createdById: z.string().min(1, 'El ID del creador es requerido'),
  players: z.array(z.string()).optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

const TeamForm: React.FC = () => {
  const navigate = useNavigate();
  const mutation = useCreateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { players: [] },
  });

  const onSubmit = (data: TeamFormData) => {
    mutation.mutate(data, {
      onSuccess: () => navigate('/teams'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver a Equipos</span>
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Crear Nuevo Equipo</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Equipo
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre del equipo"
              />
              {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name.message}</div>}
            </div>
            <div className="mb-4">
              <label htmlFor="coach" className="block text-sm font-medium text-gray-700 mb-1">
                Entrenador
              </label>
              <input
                id="coach"
                type="text"
                {...register('coach')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del entrenador"
              />
              {errors.coach && <div className="text-red-600 text-sm mt-1">{errors.coach.message}</div>}
            </div>
            <div className="mb-4">
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                Imagen de Perfil (URL)
              </label>
              <input
                id="profileImage"
                type="text"
                {...register('profileImage')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="URL de la imagen"
              />
              {errors.profileImage && <div className="text-red-600 text-sm mt-1">{errors.profileImage.message}</div>}
            </div>
            <div className="mb-4">
              <label htmlFor="createdById" className="block text-sm font-medium text-gray-700 mb-1">
                ID del Creador
              </label>
              <input
                id="createdById"
                type="text"
                {...register('createdById')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ID del usuario creador"
              />
              {errors.createdById && <div className="text-red-600 text-sm mt-1">{errors.createdById.message}</div>}
            </div>
            {/* Players input can be improved with a multi-select or similar */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate('/teams')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TeamForm;