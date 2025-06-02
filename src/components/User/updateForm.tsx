"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateUser, UserState } from "@/lib/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: UserState = {
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full mt-4" disabled={pending}>
      {pending ? "Actualizando..." : "Actualizar"}
    </Button>
  );
}

export default function UpdateForm({ user }: { user: User }) {
  const [state, formAction] = useActionState(updateUser, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === 200) {
      router.push("/admin/usuarios");
    }
  }, [state.status, router]);

  return (
    <main className="flex-1 py-8 px-4 container mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{user.email}</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Nombre</Label>
          <Input type="hidden" name="userID" value={user.id} />
          <Input type="text" name="nombre" defaultValue={user.nombre} />
          {state.errors?.nombre && (
            <p className="text-red-500 text-sm">{state.errors.nombre[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Apellido Paterno</Label>
          <Input type="text" name="apellidoP" defaultValue={user.apellidoP} />
          {state.errors?.apellidoP && (
            <p className="text-red-500 text-sm">{state.errors.apellidoP[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Apellido Materno</Label>
          <Input type="text" name="apellidoM" defaultValue={user.apellidoM} />
          {state.errors?.apellidoM && (
            <p className="text-red-500 text-sm">{state.errors.apellidoM[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input type="email" name="email" defaultValue={user.email} />
          {state.errors?.email && (
            <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Boleta</Label>
          <Input type="text" name="boleta" defaultValue={user.boleta} />
          {state.errors?.boleta && (
            <p className="text-red-500 text-sm">{state.errors.boleta[0]}</p>
          )}
        </div>
        {/* 1. Alumno, 2. Profesor, 3. Admin */}
        <div className="flex flex-col gap-2">
          <Label>Rol</Label>
          <Select name="rol" defaultValue={user.rol}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Alumno</SelectItem>
              <SelectItem value="2">Profesor</SelectItem>
              <SelectItem value="3">Admin</SelectItem>
            </SelectContent>
          </Select>
          {state.errors?.rol && (
            <p className="text-red-500 text-sm">{state.errors.rol[0]}</p>
          )}
        </div>
        <SubmitButton />
      </form>
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
}
