import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Admin() {
  return (
    <div>
      <h1>Estadísticas</h1>
      <div>
        <h2>Usuarios</h2>
        <p>Total de usuarios: {29}</p>
        <Button variant="link" asChild>
          <Link href="/admin/crear-usuario">Nuevo usuario</Link>
        </Button>
      </div>
      <div>
        <h2>Usuarios</h2>
        <p>Total de materiales: {1}</p>
        <Button variant="link" asChild>
          <Link href="/admin/crear-material">Nuevo material</Link>
        </Button>
      </div>
    </div>
  );
}
