"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactFormPlaceholderProps {
  title: string;
  description: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  messageLabel: string;
  submitLabel: string;
  successTitle: string;
  successDescription: string;
  resetLabel: string;
  supportActionLabel?: string;
  supportHref?: string;
}

export function ContactFormPlaceholder({
  title,
  description,
  nameLabel,
  emailLabel,
  phoneLabel,
  messageLabel,
  submitLabel,
  successTitle,
  successDescription,
  resetLabel,
  supportActionLabel,
  supportHref,
}: ContactFormPlaceholderProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-third">{description}</p>
      </div>

      {submitted ? (
        <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
          <CheckCircle2 className="mx-auto size-10 text-success" />
          <p className="mt-3 font-semibold text-primary">{successTitle}</p>
          <p className="mt-1 text-sm text-third">{successDescription}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setSubmitted(false)}>
              {resetLabel}
            </Button>
            {supportActionLabel && supportHref ? (
              <a
                href={supportHref}
                className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-5 text-sm font-medium text-white"
              >
                {supportActionLabel}
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={nameLabel} required />
            <Input label={emailLabel} type="email" required />
          </div>
          <Input label={phoneLabel} type="tel" />
          <Textarea label={messageLabel} rows={4} required />
          <Button type="submit" backgroundColor="var(--color-secondary)" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </form>
      )}
    </div>
  );
}
