"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/lib/utils";

export function FooterNewsletterForm() {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "success">("idle");

  return (
    <div className="w-full md:w-auto">
      <form
        className="flex gap-2 w-full md:w-auto"
        onSubmit={(event) => {
          event.preventDefault();

          if (!isValidEmail(email)) {
            setState("error");
            return;
          }

          setState("success");
          setEmail("");
        }}
      >
        <Input
          id="footer-newsletter-email-input"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== "idle") {
              setState("idle");
            }
          }}
          placeholder={t("emailPlaceholder")}
          className="bg-white/10 border-white/20 text-white placeholder:text-third2 focus:bg-white/20 focus:ring-white flex-1 md:w-80 min-w-0"
        />

        <Button type="submit" backgroundColor="var(--color-secondary)">
          {t("subscribeButton")}
        </Button>
      </form>

      {state === "error" ? (
        <p className="mt-2 text-xs text-red-200">{t("newsletterInvalidEmail")}</p>
      ) : null}
      {state === "success" ? (
        <p className="mt-2 text-xs text-emerald-200">{t("newsletterFrontendSuccess")}</p>
      ) : null}
    </div>
  );
}
