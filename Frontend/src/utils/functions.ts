export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export function translateEventType(type: string) {
  switch (type) {
    case "goal":
      return "Gol";
    case "card":
      return "Tarjeta";
    case "yellowCard":
      return "Tarjeta Amarilla";
    case "redCard":
      return "Tarjeta Roja";
    case "blueCard":
      return "Tarjeta Azul";
    case "start_first_half":
      return "Inicio Primer Tiempo";
    case "end_first_half":
      return "Fin Primer Tiempo";
    case "start_second_half":
      return "Inicio Segundo Tiempo";
    case "end_second_half":
      return "Fin Segundo Tiempo";
    default:
      return type;
  }
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "Fecha";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
