import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { fetchUsers } from "@/lib/data";
import { Pencil } from "lucide-react";
import DeleteUser from "@/components/DeleteUser";
import Link from "next/link";

export default async function UsuariosPage() {
  const users = await fetchUsers();

  if (users.data.length === 0) {
    return (
      <main className="flex-1 py-8 px-4 container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
        <p className="text-gray-500 text-center">Aún no hay usuarios</p>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8 px-4 container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nombre</TableHead>
            <TableHead>Apellido Paterno</TableHead>
            <TableHead>Apellido Materno</TableHead>
            <TableHead className="text-right">Email</TableHead>
            <TableHead className="text-right">Boleta</TableHead>
            <TableHead className="text-right">Rol</TableHead>
            <TableHead className="text-right">Fecha de Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data.map((user: User) => (
            <TableRow key={user.id}>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.apellidoP}</TableCell>
              <TableCell>{user.apellidoM}</TableCell>
              <TableCell className="text-right">{user.email}</TableCell>
              <TableCell className="text-right">{user.boleta}</TableCell>
              <TableCell className="text-right">
                {roles[user.rol as keyof typeof roles]}
              </TableCell>
              <TableCell className="text-right">{user.fechaCreacion}</TableCell>
              <TableCell className="text-right flex gap-2 items-center justify-end">
                <DeleteUser userID={user.id} />
                <Button variant="ghost" size="icon">
                  <Link href={`/admin/usuarios/${user.id}`}>
                    <Pencil />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}

interface User {
  id: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  email: string;
  boleta: string;
  rol: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  verificacionEmail: boolean;
}

const roles = {
  "1": "Alumno",
  "2": "Profesor",
  "3": "Administrador",
};
