import { FolderClosed } from "lucide-react";

import { SignupForm } from "@/components/Signup";

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6">
      <div className="flex w-full flex-col gap-6">
        <SignupForm />
      </div>
    </div>
  );
}
