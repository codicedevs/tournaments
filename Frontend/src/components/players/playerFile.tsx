import React from "react";
import { Star } from "lucide-react";

interface PlayerFileProps {
  name: string;
  profilePicture?: string;
  phone?: string;
  teamName?: string;
  isCaptain?: boolean;
  isVerified?: boolean;
  dni?: string;
  onCheckDni?: () => void;
}

const PlayerFile: React.FC<PlayerFileProps> = ({
  name,
  profilePicture,
  phone,
  teamName,
  isCaptain,
  isVerified,
  dni,
  onCheckDni,
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-blue-200">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-5xl text-gray-400">
              {name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {isCaptain && (
          <span
            title="Capitán"
            className="absolute -bottom-2 -right-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-white font-bold text-lg border-4 border-white shadow-lg"
          >
            C
            <Star className="w-4 h-4 ml-1 text-white" fill="#fff" />
          </span>
        )}
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{name}</h2>
        <div className="text-gray-600 mb-2">{teamName || "Sin equipo"}</div>
        <div className="text-gray-700 mb-2">
          <span className="font-semibold">Teléfono:</span> {phone || "-"}
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          {isVerified ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              Verificado
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              No verificado
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="font-semibold">DNI:</span>{" "}
          {dni || <span className="text-gray-400">No cargado</span>}
          <button
            className="ml-2 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold border border-blue-200"
            onClick={onCheckDni}
            disabled={!dni}
          >
            Chequear DNI
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerFile;
