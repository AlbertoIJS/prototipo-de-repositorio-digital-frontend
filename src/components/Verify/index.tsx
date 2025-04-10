"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyCode } from "@/lib/data";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export default function InputOTPForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const router = useRouter();
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const userID = localStorage.getItem("userID");

    if (!userID) {
      alert("Error al iniciar sesión. Por favor, vuelve a intentarlo.");
      return;
    }

    const res = await verifyCode({
      code: data.pin,
      userID,
    });

    if (res.ok) {
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("expiresAt", res.data.expiresAt);

      router.push("/");
    } else {
      alert(`Verification failed. ${res.error}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Verificación</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  pasteTransformer={(pasted) => pasted.replaceAll("-", "")}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Introduce el código de verificación que se te ha enviado por
                correo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="cursor-pointer">
          Enviar
        </Button>
      </form>
    </Form>
  );
}
