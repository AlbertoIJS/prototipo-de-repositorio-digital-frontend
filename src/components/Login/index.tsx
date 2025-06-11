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
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-lg p-6">
        {/* Institutional Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-6 mb-6">
            <img
              src="/ipn.png"
              alt="IPN Logo"
              className="object-contain w-16 h-16"
            />
            <div className="h-12 w-px bg-slate-300"></div>
            <img
              src="/escom.png"
              alt="ESCOM Logo"
              className="object-contain w-14 h-14"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Prototipo de Repositorio Digital
          </h1>
          <p className="text-slate-600 text-sm">Escuela Superior de Cómputo</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-slate-800">
              Acceso al Sistema
            </CardTitle>
            <CardDescription className="text-slate-600">
              Ingresa con tu correo institucional para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid gap-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-6"
                >
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm flex items-center gap-2">
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Correo Institucional
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg
                                className="h-5 w-5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                />
                              </svg>
                            </div>
                            <Input
                              placeholder="tu.nombre@alumno.ipn.mx"
                              type="email"
                              className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Iniciar Sesión
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">
                    ¿Primera vez?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-600 text-sm mb-3">
                  ¿No tienes una cuenta todavía?
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center w-full h-11 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Crear Nueva Cuenta
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="text-slate-500 text-xs text-balance">
            Al continuar, aceptas nuestros{" "}
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              Términos y Condiciones
            </Link>{" "}
            y{" "}
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              Política de Privacidad
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-400">
              © 2025 Instituto Politécnico Nacional - ESCOM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
