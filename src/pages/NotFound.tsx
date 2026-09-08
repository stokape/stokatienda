import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 py-16">
      <EmptyState
        icon={Compass}
        title="Página no encontrada"
        description="El enlace que seguiste no existe o fue movido."
        action={
          <Link to="/" className="font-semibold text-stoka-green-700 underline">
            Volver al inicio
          </Link>
        }
      />
    </div>
  );
}
