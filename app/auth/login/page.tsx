import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function Page() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoadingSpinner label="Loading login…" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
