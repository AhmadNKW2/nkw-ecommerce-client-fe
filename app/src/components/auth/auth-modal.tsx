"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getReturnToFromWindow } from "@/lib/auth-redirect";
import { consumePostAuthRedirect } from "@/lib/post-auth-redirect";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register";
  returnTo?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialView = "login",
  returnTo,
}: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(initialView);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [initialView, isOpen]);

  const handleSuccess = () => {
    const redirectTarget = consumePostAuthRedirect(returnTo);
    const currentPath = getReturnToFromWindow(pathname);

    onClose();

    if (redirectTarget && redirectTarget !== currentPath) {
      router.push(redirectTarget);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full p-6 bg-white rounded-xl">
      {view === "login" ? (
        <LoginForm 
            onSuccess={handleSuccess}
            onRegisterClick={() => setView("register")}
            returnTo={returnTo}
        />
      ) : (
        <RegisterForm 
            onSuccess={handleSuccess}
            onLoginClick={() => setView("login")}
            returnTo={returnTo}
        />
      )}
    </Modal>
  );
}
