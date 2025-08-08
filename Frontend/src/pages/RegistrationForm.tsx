import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, SearchIcon, ChevronDownIcon } from "lucide-react";
import { createPortal } from "react-dom";
import Header from "../components/layout/Header";
import {
  useCreateRegistration,
  useRegistrations,
} from "../api/registrationHooks";
import { useTournaments, useTournament } from "../api/tournamentHooks";
import { useTeams } from "../api/teamHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";
import { Team } from "../models";

const registrationSchema = z.object({
  teamId: z.string().min(1, "El equipo es requerido"),
  tournamentId: z.string().min(1, "El torneo es requerido"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId: preselectedTournamentId } = useParams<{
    tournamentId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get("phaseId");
  const [error, setError] = useState("");
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  // Form setup
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    getValues,
    resetField,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      tournamentId: preselectedTournamentId || "",
    },
  });

  // Set preselected tournament if available
  useEffect(() => {
    if (preselectedTournamentId) {
      setValue("tournamentId", preselectedTournamentId);
    }
  }, [preselectedTournamentId, setValue]);

  // Watch for values
  const selectedTournamentId = watch("tournamentId");

  // Limpiar estado del autocompletar cuando cambie el torneo
  useEffect(() => {
    setTeamSearchTerm("");
    setIsTeamDropdownOpen(false);
    setSelectedTeamIndex(-1);
    resetField("teamId");
  }, [selectedTournamentId, resetField]);

  // Data fetching
  const { data: tournaments = [], isLoading: isLoadingTournaments } =
    useTournaments();
  const { data: teams = [], isLoading: isLoadingTeams } = useTeams();
  const {
    mutateAsync: registerTeam,
    isPending: isRegistering,
    isError: isErrorRegistro,
    error: errorRegistro,
  } = useCreateRegistration();
  const [registroTerminado, setRegistroTerminado] = useState(false);
  const { data: selectedTournament } = useTournament(selectedTournamentId);
  // Todas las registrations para filtrar equipos ya registrados en cualquier torneo
  const { data: allRegistrations = [] } = useRegistrations();
  // Equipos ya registrados en el torneo específico
  const { data: registrationsByTournament = [] } =
    useRegistrationsByTournament(selectedTournamentId);

  const isLoading = isLoadingTournaments || isLoadingTeams || isRegistering;

  // Estado para equipos a registrar
  const [pendingTeams, setPendingTeams] = useState<Team[]>([]);

  // Obtener IDs de equipos que ya están registrados en cualquier torneo
  const registeredTeamIds = allRegistrations.map((reg) =>
    typeof reg.teamId === "string" ? reg.teamId : reg.teamId?._id
  );

  // Filtrar equipos basado en el término de búsqueda y que no estén registrados en ningún torneo
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) &&
      !registeredTeamIds.includes(team._id)
  );

  // Función para manejar la selección de equipo con teclado
  const handleTeamKeyDown = (e: React.KeyboardEvent) => {
    if (!isTeamDropdownOpen) {
      if (e.key === "Enter") {
        e.preventDefault();
        const values = getValues();
        // Si ya hay un equipo seleccionado en el input, agregarlo directamente
        if (values.teamId) {
          handleAddTeam();
        } else {
          // Abrir el dropdown para seleccionar
          setIsTeamDropdownOpen(true);
          setSelectedTeamIndex(0);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsTeamDropdownOpen(true);
        setSelectedTeamIndex(0);
      }
      return;
    }

    const maxIndex = Math.min(filteredTeams.length - 1, 4); // Máximo 5 equipos (0-4)

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedTeamIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedTeamIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedTeamIndex >= 0 && selectedTeamIndex <= maxIndex) {
          const selectedTeam = filteredTeams[selectedTeamIndex];
          setValue("teamId", selectedTeam._id);
          setTeamSearchTerm(selectedTeam.name);
          setIsTeamDropdownOpen(false);
          setSelectedTeamIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsTeamDropdownOpen(false);
        setSelectedTeamIndex(-1);
        break;
    }
  };

  // Función para seleccionar equipo con click
  const handleTeamSelect = (team: Team) => {
    setValue("teamId", team._id);
    setTeamSearchTerm(team.name);
    setIsTeamDropdownOpen(false);
    setSelectedTeamIndex(-1);
  };

  // Función para manejar cambios en el input de búsqueda
  const handleTeamSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamSearchTerm(value);
    setIsTeamDropdownOpen(true);
    setSelectedTeamIndex(-1);

    // Si el valor está vacío, limpiar el campo teamId
    if (!value) {
      setValue("teamId", "");
    }
  };

  // Función para calcular la posición del dropdown
  const updateDropdownPosition = () => {
    if (inputRef) {
      const rect = inputRef.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Actualizar posición cuando se abre el dropdown
  useEffect(() => {
    if (isTeamDropdownOpen) {
      updateDropdownPosition();
    }
  }, [isTeamDropdownOpen, teamSearchTerm]);

  const handleAddTeam = () => {
    setError("");
    const values = getValues();
    if (!values.teamId) {
      setError("Seleccione un equipo");
      return;
    }
    const team = teams.find((t) => t._id === values.teamId);
    if (!team) return;
    if (pendingTeams.some((t) => t._id === team._id)) {
      setError("Este equipo ya está en la lista para registrar.");
      return;
    }
    setPendingTeams((prev) => [...prev, team]);
    resetField("teamId");
    setTeamSearchTerm("");
    setIsTeamDropdownOpen(false);
    setSelectedTeamIndex(-1);
  };

  const handleConfirmAll = async (e: any) => {
    e.stopPropagation();
    setError("");
    setRegistroTerminado(false);
    // if (pendingTeams.length === 0) return;

    type Result = { team: Team; success: boolean; error?: any };
    const promises = pendingTeams.map(
      (team) =>
        new Promise<Result>((resolve) => {
          registerTeam(
            { teamId: team._id, tournamentId: selectedTournamentId },
            {
              onSuccess: () => resolve({ team, success: true }),
              onError: (error) => resolve({ team, success: false, error }),
            }
          )
            .then(() => resolve({ team, success: true }))
            .catch((error) => resolve({ team, success: false, error }));
        })
    );

    await Promise.all(promises);

    const base = `/divisions/${selectedTournamentId}/registrations`;
    navigate(phaseId ? `${base}?phaseId=${phaseId}` : base);
  };

  const handleRemovePending = (id: string) => {
    setPendingTeams((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() => {
            if (preselectedTournamentId) {
              const base = `/divisions/${preselectedTournamentId}/registrations`;
              navigate(phaseId ? `${base}?phaseId=${phaseId}` : base);
            } else {
              navigate("/divisions");
            }
          }}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver</span>
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">
              {selectedTournament
                ? `Registrar Equipo en: ${selectedTournament.name}`
                : "Registrar Equipo en Torneo"}
            </h1>
          </div>
          <form
            className="p-6"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
          >
            {isErrorRegistro && errorRegistro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {typeof errorRegistro === "string"
                  ? errorRegistro
                  : (errorRegistro as any).message ||
                    "Ocurrió un error inesperado."}
              </div>
            )}

            {!preselectedTournamentId && (
              <div className="mb-4">
                <label
                  htmlFor="tournamentId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Torneo
                </label>
                <select
                  id="tournamentId"
                  {...register("tournamentId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading || !!preselectedTournamentId}
                >
                  <option value="">Seleccione un torneo</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament._id} value={tournament._id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
                {errors.tournamentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tournamentId.message}
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="teamId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Equipo
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Solo se muestran equipos que no están registrados en ningún
                torneo
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={teamSearchTerm}
                      onChange={handleTeamSearchChange}
                      onKeyDown={handleTeamKeyDown}
                      onFocus={() => {
                        setIsTeamDropdownOpen(true);
                        updateDropdownPosition();
                      }}
                      onBlur={() => {
                        // Delay closing to allow click events
                        setTimeout(() => setIsTeamDropdownOpen(false), 200);
                      }}
                      placeholder="Buscar equipo..."
                      className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                      ref={setInputRef}
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dropdown de equipos - Removido del contenedor relativo */}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading}
                  onClick={handleAddTeam}
                >
                  Agregar
                </button>
              </div>
              {errors.teamId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.teamId.message}
                </p>
              )}
            </div>

            {pendingTeams.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipos a registrar:
                </label>
                <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTeams.map((team, idx) => (
                        <tr
                          key={team._id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-2 text-gray-900">
                            {team.name}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              className="text-red-600 hover:underline text-xs"
                              onClick={() => handleRemovePending(team._id)}
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (preselectedTournamentId) {
                    const base = `/divisions/${preselectedTournamentId}/registrations`;
                    navigate(phaseId ? `${base}?phaseId=${phaseId}` : base);
                  } else {
                    navigate("/divisions");
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Cancelar
              </button>
              {!isErrorRegistro && registroTerminado ? (
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => {
                    if (preselectedTournamentId) {
                      const base = `/divisions/${preselectedTournamentId}/registrations`;
                      navigate(phaseId ? `${base}?phaseId=${phaseId}` : base);
                    } else {
                      navigate("/divisions");
                    }
                  }}
                >
                  Volver a la lista
                </button>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  disabled={isLoading || pendingTeams.length === 0}
                  onClick={handleConfirmAll}
                >
                  Confirmar registro de {pendingTeams.length} equipo(s)
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Portal para el dropdown de equipos */}
      {isTeamDropdownOpen &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 9999,
            }}
          >
            {filteredTeams.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredTeams.slice(0, 5).map((team, index) => (
                  <div
                    key={team._id}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                      index === selectedTeamIndex ? "bg-blue-100" : ""
                    } ${
                      pendingTeams.some((t) => t._id === team._id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => {
                      if (!pendingTeams.some((t) => t._id === team._id)) {
                        handleTeamSelect(team);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{team.name}</span>
                      {pendingTeams.some((t) => t._id === team._id) && (
                        <span className="text-xs text-gray-500">
                          Ya agregado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredTeams.length > 5 && (
                  <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                    Mostrando 5 de {filteredTeams.length} equipos. Usa la
                    búsqueda para encontrar más equipos.
                  </div>
                )}
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {teamSearchTerm && filteredTeams.length === 0 && (
              <div className="bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="px-3 py-2 text-sm text-gray-500">
                  No se encontraron equipos con "{teamSearchTerm}"
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default RegistrationForm;
