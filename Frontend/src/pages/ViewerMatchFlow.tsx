import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ViewerMatchList from "./ViewerMatchList";
import ConfirmTeams from "./ComfirmTeams";
import MatchOn from "./MatchOn";

// Puedes agregar más pasos aquí en el futuro
type Step = "list" | "confirm" | "onmatch";

const ViewerMatchFlow: React.FC = () => {
  const { idmatch } = useParams<{ idmatch: string }>();
  const [step, setStep] = useState<Step>("list");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    idmatch || null
  );
  const [confirmedPlayers, setConfirmedPlayers] = useState<any[]>([]);
  const [soloLectura, setSoloLectura] = useState(false);

  // Aquí podrías obtener el viewerId de contexto, props, o auth
  const viewerId = "68546b7d85fe3cc12b8aeab2"; // Reemplaza por el real

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step !== "list") {
        e.preventDefault();
        e.returnValue =
          "Si sales o recargas, se perderá el progreso realizado en este partido.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [step]);

  // Paso 1: Lista de partidos del veedor
  if (step === "list") {
    return (
      <ViewerMatchList
        viewerId={viewerId}
        onSelectMatch={(id: string) => {
          setSelectedMatchId(id);
          setStep("confirm");
        }}
      />
    );
  }

  return (
    <div>
      <div className={step === "confirm" ? "" : "hidden"}>
        {selectedMatchId && (
          <ConfirmTeams
            matchId={selectedMatchId}
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
            matchId={selectedMatchId}
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
