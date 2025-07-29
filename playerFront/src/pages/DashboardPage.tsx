import { useApp } from "../context/AppContext";
import { Navigate } from "react-router-dom";

export function DashboardPage() {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold">Bienvenido {user.name}!</h1>
    </div>
  );
}
