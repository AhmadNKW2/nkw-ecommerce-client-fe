"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { buildAuthHref } from "@/lib/auth-redirect";
import { consumePostAuthRedirect } from "@/lib/post-auth-redirect";

export function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  return (
    <Card className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl">
      <RegisterForm
        onSuccess={() => router.push(consumePostAuthRedirect(returnTo) ?? "/")}
        onLoginClick={() => router.push(buildAuthHref("/login", returnTo))}
        returnTo={returnTo ?? undefined}
      />
    </Card>
  );
}