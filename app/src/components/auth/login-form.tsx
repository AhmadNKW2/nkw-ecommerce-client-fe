"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AuthFormHeader } from "./auth-form-header";
import { AuthErrorAlert } from "./auth-error-alert";
import { AuthSocialButtons } from "./auth-social-buttons";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
  returnTo?: string;
}

export function LoginForm({ onSuccess, onRegisterClick, returnTo }: LoginFormProps) {
  const t = useTranslations("auth");
  const { login, isLoggingIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const getFriendlyLoginError = (value: unknown) => {
    const message = value instanceof Error ? value.message : "";

    if (/invalid credentials/i.test(message)) {
      return t("invalidCredentials");
    }

    if (/account is deactivated/i.test(message)) {
      return t("accountDeactivated");
    }

    return message || t("loginUnexpectedError");
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await login(data);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      setError(getFriendlyLoginError(error));
    }
  };

  return (
    <div className="w-full">
      <AuthFormHeader
        title={t("loginTitle")}
        prompt={t("noAccount")}
        actionLabel={t("registerNow")}
        onAction={onRegisterClick}
      />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {error && <AuthErrorAlert message={error} />}

        <Input
          id="email"
          type="email"
          label={t("email")}
          placeholder={t("email")}
          error={errors.email ? t("invalidEmail") : undefined}
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          label={t("password")}
          placeholder={t("password")}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="font-medium text-secondary hover:text-primary2 transition"
          >
            {t("forgotPassword")}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t("login")}
        </Button>
      </form>

      <AuthSocialButtons returnTo={returnTo} />
    </div>
  );
}
