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
import { toast } from "sonner";
import { setCookie, getCookie } from "@/lib/cookies";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "El código de verificación debe tener 6 dígitos",
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
    console.log("=== VERIFICATION FORM SUBMITTED ===");
    console.log("Form data:", data);
    
    const userID = localStorage.getItem("userID");
    console.log("Retrieved userID from localStorage:", userID);

    if (!userID) {
      console.error("No userID found in localStorage");
      toast.error("Error al iniciar sesión. Por favor, vuelve a intentarlo.");
      return;
    }

    try {
      console.log("Calling verifyCode with:", { code: data.pin, userID });
      
      const res = await verifyCode({
        code: data.pin,
        userID,
      });

      if (res.ok) {
        console.log("Verification successful, setting cookies...");
        console.log("Token received:", {
          exists: !!res.data.data.accessToken,
          type: typeof res.data.data.accessToken,
          length: res.data.data.accessToken?.length || 0,
          firstChars: res.data.data.accessToken?.substring(0, 20) || "N/A"
        });
        
        const tokenSet = setCookie("auth_token", res.data.data.accessToken);
        
        if (!tokenSet) {
          console.error("Failed to set auth_token cookie");
          toast.error("Error al guardar la sesión. Por favor, intenta nuevamente.");
          return;
        }

        console.log("Cookie set successfully, verifying...");
        // Verify the cookie was actually set
        const retrievedToken = getCookie("auth_token");
        console.log("Retrieved token after setting:", {
          exists: !!retrievedToken,
          matches: retrievedToken === res.data.data.accessToken
        });

        console.log("Verification successful, redirecting to home...");
        // Add a small delay to ensure cookie is fully set before redirect
        setTimeout(() => {
          router.push("/");
        }, 100);
      } else {
        console.error("Verification failed:", res);
        toast.error(`Verificación fallida, intenta nuevamente`);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("Error durante la verificación. Por favor, intenta nuevamente.");
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
