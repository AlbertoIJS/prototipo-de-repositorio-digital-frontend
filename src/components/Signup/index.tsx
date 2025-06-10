"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signup } from "@/lib/data";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import z from "zod";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  email: z.string().email({ message: "Correo inválido" }),
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  paternalLastName: z.string().min(3, {
    message: "El apellido paterno debe tener al menos 3 caracteres",
  }),
  maternalLastName: z.string().min(3, {
    message: "El apellido materno debe tener al menos 3 caracteres",
  }),
  studentId: z
    .string()
    .min(10, { message: "La boleta debe tener 10 caracteres" })
    .max(10, { message: "La boleta debe tener 10 caracteres" })
    .refine((val) => val.length >= 5 && val[4] === "6", {
      message: "Boleta de no válida",
    })
    .refine((val) => val.length >= 6 && val[5] === "3", {
      message: "Boleta de no válida",
    }),
});

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      studentId: "",
      name: "",
      paternalLastName: "",
      maternalLastName: "",
    },
  });

  const router = useRouter();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(null);

    try {
      const res = await signup(data);

      console.log(res);

      if (res?.ok) {
        localStorage.setItem("userID", res.data.data.id);
        router.push("/verificar");
      }
    } catch (error) {
      console.log("Error al crear la cuenta: ", error);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
          <CardDescription>Introduce tu correo y contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nombre@alumno.ipn.mx"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boleta</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paternalLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Paterno</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maternalLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Materno</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full cursor-pointer">
                Registrarme
              </Button>

              <div className="text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Al continuar, aceptas nuestros <br />{" "}
        <Link href="#">Términos y Condiciones</Link>
        {""}, <Link href="#">Política de Privacidad</Link>.
      </div>
    </div>
  );
}
