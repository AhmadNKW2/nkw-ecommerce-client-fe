"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useContext, useState, ReactNode } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { usePathname } from "@/i18n/navigation";
import { getReturnToFromPath } from "@/lib/auth-redirect";

interface OpenAuthModalOptions {
  returnTo?: string;
}

interface AuthModalContextType {
  openAuthModal: (
    view?: "login" | "register",
    options?: OpenAuthModalOptions,
  ) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"login" | "register">("login");
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openAuthModal = (
    initialView: "login" | "register" = "login",
    options?: OpenAuthModalOptions,
  ) => {
    setView(initialView);
    setReturnTo(options?.returnTo ?? getReturnToFromPath(pathname, searchParams));
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setReturnTo(undefined);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthModalOpen: isOpen }}>
      {children}
      <AuthModal 
        isOpen={isOpen} 
        onClose={closeAuthModal} 
        initialView={view}
        returnTo={returnTo}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
