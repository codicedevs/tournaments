import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ViewerMatchList from "./ViewerMatchList";
import ConfirmTeams from "./ComfirmTeams";
import MatchOn from "./MatchOn";
import MatchReport from "./MatchReport";
import { useUsers } from "../api/userHooks";

// Puedes agregar más pasos aquí en el futuro
type Step = "list" | "confirm" | "onmatch" | "report" | "select-viewer";

const ViewerMatchFlow: React.FC = () => {
  const { idmatch } = useParams<{ idmatch: string }>();
  const [step, setStep] = useState<Step>("select-viewer");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    idmatch || null
  );
  const [confirmedPlayers, setConfirmedPlayers] = useState<any[]>([]);
  const [soloLectura, setSoloLectura] = useState(false);
  const [viewerId, setViewerId] = useState<string | undefined>(undefined);
  const { data: users = [], isLoading } = useUsers();
  const viewers = users.filter((u: any) => u.role === "Viewer");
  const navigate = useNavigate();

  // Paso 0: Selector de veedor
  if (step === "select-viewer") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white py-12 px-4 ">
        <div className="w-full max-w-xl mx-auto rounded-2xl shadow-xl p-8 flex flex-col items-center bg-gray-100 ">
          <h2 className="text-3xl font-bold mb-2 text-blue-800">
            Selecciona un veedor
          </h2>
          <p className="mb-8 text-gray-600 text-center">
            Elige el veedor para ver y gestionar sus partidos asignados.
          </p>
          {isLoading ? (
            <div className="text-gray-500">Cargando veedores...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              {viewers.map((viewer) => (
                <button
                  key={viewer._id}
                  className="flex items-center gap-4 w-full bg-gradient-to-br from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-xl p-5 shadow transition group"
                  onClick={() => {
                    setViewerId(viewer._id);
                    setStep("list");
                  }}
                >
                  {viewer.profilePicture ? (
                    <img
                      src={viewer.profilePicture}
                      alt={viewer.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-300 group-hover:border-blue-500 transition"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-blue-400 border-2 border-blue-200 group-hover:border-blue-500 transition">
                      {viewer.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xl font-semibold text-blue-900 group-hover:text-blue-700 transition">
                    {viewer.name}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium shadow"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Paso 1: Lista de partidos del veedor
  if (step === "list") {
    const selectedViewer = viewers.find((v) => v._id === viewerId);
    return (
      <div>
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl my-10 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white px-8 py-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {selectedViewer?.profilePicture && (
                <img
                  src={selectedViewer.profilePicture}
                  alt={selectedViewer.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                />
              )}
              <div>
                <h1 className="text-3xl font-light mb-1">
                  Mis Partidos Asignados
                </h1>
                <div className="text-base opacity-80 font-semibold">
                  {selectedViewer?.name}
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep("select-viewer")}
              className="flex items-center gap-1 text-blue-100 hover:text-white px-4 py-2 rounded-md border border-blue-200 bg-blue-600 hover:bg-blue-700 transition"
            >
              ← Cambiar veedor
            </button>
          </div>
          <ViewerMatchList
            viewerId={viewerId!}
            onSelectMatch={async (id: string) => {
              if (window.location.pathname.endsWith("/report")) {
                setSelectedMatchId(id);
                setStep("report");
              } else {
                setSelectedMatchId(id);
                setStep("confirm");
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (step === "report") {
    return (
      <MatchReport matchId={selectedMatchId || undefined} soloLectura={true} />
    );
  }

  return (
    <div>
      <div className={step === "confirm" ? "" : "hidden"}>
        {selectedMatchId && (
          <ConfirmTeams
            matchId={selectedMatchId!}
            onConfirm={(players: any[]) => {
              setConfirmedPlayers(players);
              setStep("onmatch");
            }}
            onBack={() => {
              if (
                window.confirm(
                  "¿Seguro que quieres volver? Se perderá el progreso realizado en este partido."
                )
              ) {
                setStep("list");
                setSoloLectura(false);
              }
            }}
            soloLectura={soloLectura}
          />
        )}
      </div>
      <div className={step === "onmatch" ? "" : "hidden"}>
        {selectedMatchId && (
          <MatchOn
            matchId={selectedMatchId!}
            confirmedPlayers={confirmedPlayers}
            onBack={(secondHalfStarted: boolean) => {
              setSoloLectura(secondHalfStarted);
              setStep("confirm");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ViewerMatchFlow;
