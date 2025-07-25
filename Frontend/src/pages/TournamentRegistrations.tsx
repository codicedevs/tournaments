import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, UserMinusIcon } from "lucide-react";
import Header from "../components/layout/Header";
import {
  useRegistrationsByTournament,
  useDeleteRegistration,
} from "../api/registrationHooks";
import { useTournament } from "../api/tournamentHooks";
import { PopulatedRegistration } from "../models/Registration";
import { Team } from "../models";

const TournamentRegistrations: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams<{ tournamentId: string }>();

  // Data fetching
  const {
    data: registrations = [],
    isLoading: isLoadingRegistrations,
    isError: isRegistrationsError,
    refetch: refetchRegistrations,
  } = useRegistrationsByTournament(tournamentId);

  const {
    data: tournament,
    isLoading: isTournamentLoading,
    isError: isTournamentError,
  } = useTournament(tournamentId || "");

  const { mutate: deleteRegistration } = useDeleteRegistration();
  const [selected, setSelected] = React.useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selected.length === 0) return;
    if (
      !window.confirm(
        `¿Seguro que deseas borrar ${selected.length} registro(s)?`
      )
    )
      return;
    selected.forEach((id) =>
      deleteRegistration(id, { onSuccess: () => refetchRegistrations() })
    );
    setSelected([]);
  };

  const isLoading = isLoadingRegistrations || isTournamentLoading;
  const isError = isRegistrationsError || isTournamentError;

  const handleDeleteRegistration = (registrationId: string) => {
    if (confirm("¿Seguro que desea eliminar este equipo del torneo?")) {
      deleteRegistration(registrationId, {
        onSuccess: () => {
          refetchRegistrations();
        },
      });
    }
  };

  // Type-safe helper function with null checking
  const getTeamInfo = (
    registration: PopulatedRegistration
  ): {
    id: string;
    name: string;
    coach: string;
  } => {
    if (!registration.teamId) {
      return {
        id: "N/A",
        name: "Equipo no disponible",
        coach: "No disponible",
      };
    }

    const team = registration.teamId as Team;
    return {
      id: team._id || "N/A",
      name: team.name || "Sin nombre",
      coach: team.coach || "Sin entrenador",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/tournaments")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver a Torneos</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {tournament
                ? `Equipos en ${tournament.name}`
                : "Equipos Registrados"}
            </h1>
            <p className="text-gray-600">
              Gestiona los equipos registrados en este torneo
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Equipos Registrados
            </h1>
            <p className="text-gray-600">{tournament?.name || "Torneo"}</p>
          </div>
          <button
            onClick={() =>
              navigate(`/tournaments/${tournamentId}/register-team`)
            }
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon size={18} />
            <span>Registrar Equipo</span>
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Cargando equipos registrados...
            </p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">
              Error al cargar los equipos registrados. Inténtelo de nuevo más
              tarde.
            </p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">
              No hay equipos registrados en este torneo.
            </p>
            <button
              onClick={() =>
                navigate(`/tournaments/${tournamentId}/register-team`)
              }
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon size={18} />
              <span>Registrar Primer Equipo</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selected.length === registrations.length &&
                        registrations.length > 0
                      }
                      onChange={() => {
                        if (selected.length === registrations.length)
                          setSelected([]);
                        else setSelected(registrations.map((r) => r._id));
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrenador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => {
                  const team = getTeamInfo(registration);
                  return (
                    <tr
                      key={registration._id}
                      className={
                        selected.includes(registration._id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(registration._id)}
                          onChange={() => toggleSelect(registration._id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team.coach}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(
                          registration.registrationDate
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() =>
                            handleDeleteRegistration(registration._id)
                          }
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                        >
                          <UserMinusIcon size={16} />
                          <span>Eliminar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {selected.length > 0 && (
              <div className="my-4 flex justify-end">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
                  onClick={handleDeleteSelected}
                >
                  Borrar seleccionados ({selected.length})
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TournamentRegistrations;
