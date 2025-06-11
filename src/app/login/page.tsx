import { LoginForm } from "@/components/Login";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex w-full flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
