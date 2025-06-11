"use client";

import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { signin } from "@/lib/data";
import { toast } from "sonner";
import Link from "next/link";

const FormSchema = z.object({
  email: z
    .string()
    .email({ message: "Correo inválido" })
    .refine(
      (val) => val.includes("@") && val.split("@")[1]?.includes("ipn.mx"),
      {
        message: "El correo debe ser del dominio ipn.mx",
      }
    ),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(null);

    const res = await signin({
      email: data.email,
    });

    if (res.ok) {
      localStorage.setItem("userID", res.data.data.id);
      router.push("/verificar");
    } else {
      toast.error("Verifica tu correo e intenta nuevamente");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenido</CardTitle>
          <CardDescription>
            Inicia sesión con tu correo institucional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-6"
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

                <Button type="submit" className="w-full cursor-pointer">
                  Iniciar sesión
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Registrate
              </Link>
            </div>
          </div>
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
