"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SITE_CONFIG } from "@/lib/constants";

interface TrackOrderLookupCardProps {
  title: string;
  description: string;
  orderNumberLabel: string;
  emailLabel: string;
  submitLabel: string;
  successTitle: string;
  successDescription: string;
  accountCtaLabel: string;
  supportCtaLabel: string;
}

export function TrackOrderLookupCard({
  title,
  description,
  orderNumberLabel,
  emailLabel,
  submitLabel,
  successTitle,
  successDescription,
  accountCtaLabel,
  supportCtaLabel,
}: TrackOrderLookupCardProps) {
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const locale = useLocale();

  const whatsappNumber = SITE_CONFIG.contact.phone.replace(/\D/g, "");

  return (
    <Card className="border-gray-100 p-5 md:p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-primary">{title}</h2>
          <p className="text-sm leading-7 text-third md:text-base">{description}</p>
        </div>

        {submitted ? (
          <div className="space-y-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <div>
              <p className="font-semibold text-primary">{successTitle}</p>
              <p className="mt-1 text-sm leading-7 text-third md:text-base">{successDescription}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile/orders"
                className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white transition-colors hover:brightness-95"
              >
                {accountCtaLabel}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-gray-50"
              >
                {supportCtaLabel}
              </Link>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const message =
                locale === "ar"
                  ? `مرحبا، أريد تتبع طلبي.\nرقم الطلب: ${orderNumber}\nالبريد الإلكتروني: ${email}`
                  : `Hello, I want to track my order.\nOrder number: ${orderNumber}\nEmail: ${email}`;

              window.open(
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
                "_blank",
                "noopener,noreferrer",
              );
              setSubmitted(true);
            }}
          >
            <Input label={orderNumberLabel} value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} required />
            <Input label={emailLabel} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Button type="submit" backgroundColor="var(--color-secondary)">
              {submitLabel}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}
