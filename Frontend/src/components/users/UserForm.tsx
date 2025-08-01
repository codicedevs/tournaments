import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import { ArrowLeftIcon, UploadIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUserWithPlayer, useUpdateUser } from "../../api/userHooks";
import { useTeams } from "../../api/teamHooks";
import { usePlayerByUserId } from "../../api/playerHooks";
import { UserRole, roleLabels } from "../../models/User";
import { ROLE_PASSWORDS } from "../../config";
import { useApp } from "../../context/AppContext";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const userSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Correo electrónico inválido").optional(),
    username: z.string().optional(),
    dni: z.string().optional(),
    birthDate: z.string().optional(),
    occupation: z.string().optional(),
    healthInsurance: z.string().optional(),
    role: z.enum(Object.values(UserRole) as [UserRole, ...UserRole[]]),
    teamId: z.string().optional(),
    phone: z.string().optional(),
    isVerified: z.boolean().optional(),
    isBlacklisted: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Al menos uno de email o username debe estar presente
      return data.email || data.username;
    },
    {
      message: "Debe proporcionar al menos un email o nombre de usuario",
      path: ["email"], // Mostrar el error en el campo email
    }
  );

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  mode: "create" | "edit";
  userId?: string;
  initialData?: any;
}

// Función para obtener la contraseña según el rol desde variables de entorno
const getPasswordByRole = (role: UserRole): string => {
  return ROLE_PASSWORDS[role] || "usuario123";
};

const UserForm: React.FC<UserFormProps> = ({ mode, userId, initialData }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Estados para archivos
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [uploadedPdfs, setUploadedPdfs] = useState<string[]>([]);

  // Hooks
  const {
    mutate: createUserWithPlayer,
    isPending: isCreating,
    isError: isCreateError,
    error: createError,
  } = useCreateUserWithPlayer();

  const {
    mutate: updateUser,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
  } = useUpdateUser();

  const { data: teams = [] } = useTeams();
  const { data: playerData } = usePlayerByUserId(userId);

  const isPending = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  // Estado para manejar errores del formulario
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: UserRole.PLAYER,
      isVerified: false,
      isBlacklisted: false,
    },
  });

  const selectedRole = watch("role");
  const isAdmin = currentUser?.role === "Admin";

  // Inicializar datos si estamos en modo edición
  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        username: initialData.username || "",
        dni: initialData.dni || "",
        birthDate: initialData.birthDate || "",
        occupation: initialData.occupation || "",
        healthInsurance: initialData.healthInsurance || "",
        role: initialData.role || UserRole.PLAYER,
        teamId: initialData.teamId || "",
        phone: initialData.phone || "",
        isVerified: initialData.isVerified || false,
        isBlacklisted: initialData.isBlacklisted || false,
      });
      setProfilePictureUrl(initialData.profilePicture || null);
      setAvatarPreview(initialData.profilePicture || null);
      setUploadedPdfs(initialData.pdfs || []);
    }
  }, [mode, initialData, reset]);

  const onSubmit = (data: UserFormData) => {
    // Limpiar errores y mensajes previos
    setFormError("");
    setFormSuccess("");

    const password =
      mode === "create" ? getPasswordByRole(data.role) : undefined;

    const userData: any = {
      ...data,
      profilePicture: profilePictureUrl || undefined,
      pdfs: [...uploadedPdfs, ...pdfUrls],
    };

    if (mode === "create") {
      userData.password = password;
      userData.mustChangePassword = true;
      userData.isVerified = true;
    }

    if (data.role === "Player" && data.teamId) {
      userData.teamId = data.teamId;
    }

    if (mode === "create") {
      createUserWithPlayer(userData, {
        onSuccess: () => {
          const identifier = data.email || data.username || "Usuario";
          setFormSuccess(
            `Usuario creado exitosamente!\n\nCredenciales temporales:\nIdentificador: ${identifier}\nContraseña: ${password}\n\nEl usuario deberá cambiar su contraseña en el primer login.`
          );
          // Navegar después de 3 segundos para que el usuario vea el mensaje
          setTimeout(() => {
            navigate("/users");
          }, 3000);
        },
        onError: (error: any) => {
          // Verificar si es un error de DNI duplicado
          const errorMessage = error.response?.data?.message || error.message;
          if (errorMessage && errorMessage.includes("DNI ya está registrado")) {
            setError("dni", {
              type: "manual",
              message: "El DNI ya está registrado en el sistema",
            });
          } else {
            setFormError(errorMessage || "Error al crear el usuario");
          }
        },
      });
    } else {
      updateUser(
        {
          id: userId!,
          data: userData,
        },
        {
          onSuccess: () => {
            setFormSuccess("Usuario actualizado exitosamente!");
            // Navegar después de 2 segundos para que el usuario vea el mensaje
            setTimeout(() => {
              navigate("/users");
            }, 2000);
          },
          onError: (error: any) => {
            // Verificar si es un error de DNI duplicado
            const errorMessage = error.response?.data?.message || error.message;
            if (
              errorMessage &&
              errorMessage.includes("DNI ya está registrado")
            ) {
              setError("dni", {
                type: "manual",
                message: "El DNI ya está registrado en el sistema",
              });
            } else {
              setFormError(errorMessage || "Error al actualizar el usuario");
            }
          },
        }
      );
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));

      // Subir la imagen al backend
      const formDataFile = new FormData();
      formDataFile.append("file", file);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/users/upload`,
          formDataFile,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setProfilePictureUrl(res.data.url);
      } catch (err) {
        alert("Error subiendo la imagen de perfil");
      }
    }
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (pdfFiles.length + files.length > 2) {
      alert("Solo se pueden subir hasta 2 archivos PDF");
      return;
    }

    const newPdfFiles = [...pdfFiles, ...files];
    setPdfFiles(newPdfFiles);

    // Subir PDFs al backend
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/users/upload-pdf`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setPdfUrls((prev) => [...prev, res.data.url]);
      } catch (err) {
        alert(`Error subiendo el PDF: ${file.name}`);
      }
    }
  };

  const removePdf = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setPdfUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedPdf = (index: number) => {
    setUploadedPdfs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePdfClick = () => {
    pdfInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver a Usuarios</span>
        </button>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">
              {mode === "create" ? "Crear Nuevo Usuario" : "Editar Usuario"}
            </h1>
          </div>

          <div className="flex justify-end px-6 pt-4">
            <div
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 border-2 border-blue-400 -mt-10 -mb-5"
              onClick={handleAvatarClick}
              title="Seleccionar avatar"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Avatar</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Mostrar errores del formulario */}
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{formError}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => setFormError("")}
                        className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                      >
                        <span className="sr-only">Cerrar</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mostrar mensajes de éxito */}
            {formSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium whitespace-pre-line">
                      {formSuccess}
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => setFormSuccess("")}
                        className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                      >
                        <span className="sr-only">Cerrar</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información básica */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre del usuario"
              />
              {errors.name && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                {...register("username")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de usuario"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de DNI
              </label>
              <input
                type="text"
                {...register("dni")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="12345678"
              />
              {errors.dni && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.dni.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                {...register("birthDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.birthDate && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.birthDate.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocupación
              </label>
              <input
                type="text"
                {...register("occupation")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Estudiante, Empleado, etc."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obra Social
              </label>
              <input
                type="text"
                {...register("healthInsurance")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de la obra social"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                {...register("phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Número de teléfono"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                {...register("role")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
              {errors.role && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.role.message}
                </div>
              )}
            </div>

            {/* Contraseña temporal solo para crear */}
            {mode === "create" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Contraseña temporal:</strong>{" "}
                  {getPasswordByRole(selectedRole)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  El usuario deberá cambiar esta contraseña en su primer login.
                </p>
              </div>
            )}

            {/* Equipo solo para jugadores */}
            {selectedRole === "Player" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipo (opcional)
                </label>
                <select
                  {...register("teamId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sin equipo</option>
                  {teams.map((team: any) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campos solo para administradores */}
            {isAdmin && (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("isVerified")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Verificado
                  </label>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("isBlacklisted")}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Lista Negra
                  </label>
                </div>
              </>
            )}

            {/* Sección de PDFs */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentos PDF (máximo 2)
              </label>

              <button
                type="button"
                onClick={handlePdfClick}
                disabled={pdfFiles.length + uploadedPdfs.length >= 2}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadIcon size={16} />
                Subir PDF
              </button>

              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handlePdfChange}
              />

              {/* Mostrar PDFs subidos */}
              <div className="mt-3 space-y-2">
                {pdfFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removePdf(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                ))}

                {uploadedPdfs.map((pdfUrl, index) => (
                  <div
                    key={`uploaded-${index}`}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded"
                  >
                    <span className="text-sm text-blue-700">
                      PDF {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeUploadedPdf(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate("/users")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isPending
                  ? "Guardando..."
                  : mode === "create"
                  ? "Crear Usuario"
                  : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserForm;
