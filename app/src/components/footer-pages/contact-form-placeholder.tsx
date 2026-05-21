"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  noteLabel: string;
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
  noteLabel,
  resetLabel,
  supportActionLabel,
  supportHref,
}: ContactFormPlaceholderProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card className="overflow-hidden border-secondary/20 bg-linear-to-br from-white via-white to-secondary/10 p-0">
      <div className="h-1.5 bg-linear-to-r from-secondary via-primary2 to-primary" />
      <div className="space-y-6 p-5 md:p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-primary">{title}</h2>
          <p className="text-sm leading-7 text-third md:text-base">{description}</p>
        </div>

        {submitted ? (
          <div className="rounded-[20px] border border-success/20 bg-linear-to-br from-success/15 to-white p-5 text-sm leading-7 text-primary md:text-base">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="font-semibold text-primary">{successTitle}</p>
                <p className="mt-1 text-third">{successDescription}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="border-secondary/20 bg-white/80 hover:bg-secondary hover:text-white"
                onClick={() => setSubmitted(false)}
              >
                {resetLabel}
              </Button>
              {supportActionLabel && supportHref ? (
                <a
                  href={supportHref}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-secondary/20 bg-white/80 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-white"
                >
                  {supportActionLabel}
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input label={nameLabel} required />
              <Input label={emailLabel} type="email" required />
            </div>
            <Input label={phoneLabel} type="tel" />
            <Textarea label={messageLabel} rows={5} required />
            <div className="rounded-[20px] border border-primary/10 bg-primary/5 p-4">
              <p className="text-xs leading-6 text-third">{noteLabel}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {supportActionLabel && supportHref ? (
                <a
                  href={supportHref}
                  className="inline-flex items-center rounded-full border border-secondary/15 bg-white/80 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-primary"
                >
                  {supportActionLabel}
                </a>
              ) : null}
              <Button type="submit" backgroundColor="var(--color-secondary)" className="shadow-s1">
                {submitLabel}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
