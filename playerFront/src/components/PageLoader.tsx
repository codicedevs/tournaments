import { Loader2Icon } from "lucide-react";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Cargando..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 transition-opacity duration-300 animate-fade-in">
      <Loader2Icon size={48} className="text-orange-600 animate-spin" />
      <span className="mt-4 text-lg text-gray-600 text-center max-w-xs">
        {message}
      </span>
    </div>
  );
}
