"use client";

import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { buildAuthHref } from "@/lib/auth-redirect";
import { getReturnToQueryParamFromWindow } from "@/lib/auth-redirect";
import { consumePostAuthRedirect } from "@/lib/post-auth-redirect";

export function LoginPageClient() {
  const router = useRouter();
  const returnTo = getReturnToQueryParamFromWindow();

  return (
    <Card className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
      <LoginForm
        onSuccess={() => router.push(consumePostAuthRedirect(returnTo) ?? "/")}
        onRegisterClick={() => router.push(buildAuthHref("/register", returnTo))}
        returnTo={returnTo ?? undefined}
      />
    </Card>
  );
}