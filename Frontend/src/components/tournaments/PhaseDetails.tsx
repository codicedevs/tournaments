import React from "react";
import { Phase } from "../../models/Phase";

interface PhaseDetailsProps {
  phase: Phase;
  registrationsCount: number;
}

const PhaseDetails: React.FC<PhaseDetailsProps> = ({
  phase,
  registrationsCount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Detalles de la Fase
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Tipo
          </label>
          <p className="mt-1 text-sm text-gray-900">{phase?.type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Equipos Registrados
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {registrationsCount} equipos
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhaseDetails;
