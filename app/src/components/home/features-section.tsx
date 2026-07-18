"use client";

import { Truck, Ban, Shield, Headphones, Clock, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { ResponsiveGrid } from "@/components/ui";
import { useSeoSettings } from "@/hooks/useSeoSettings";

export function FeaturesSection() {
  const t = useTranslations('features');
  const { data: seoSettings } = useSeoSettings();

  const features = [
    ...(seoSettings?.free_delivery_enabled === false
      ? []
      : [{
          icon: Truck,
          title: t('freeShipping'),
          description: t('freeShippingDesc'),
        }]),
    {
      icon: Ban,
      title: t('easyReturns'),
      description: t('easyReturnsDesc'),
    },
    {
      icon: Shield,
      title: t('secureCheckout'),
      description: t('secureCheckoutDesc'),
    },
    {
      icon: Headphones,
      title: t('support'),
      description: t('supportDesc'),
    },
    {
      icon: Clock,
      title: t('fastDelivery'),
      description: t('fastDeliveryDesc'),
    },
    {
      icon: CreditCard,
      title: t('flexiblePayment'),
      description: t('flexiblePaymentDesc'),
    },
  ];

  return (
    <section className="bg-gray-50 rounded-r1">
      <div className="p-4">
        <ResponsiveGrid>
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 items-center text-center p-4 hover:bg-white hover:shadow-s1 rounded-xl transition-all duration-300"
            >
              <div className="p-3 bg-primary/5 rounded-full">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-primary">{feature.title}</h3>
              <p className="text-sm text-third">{feature.description}</p>
            </div>
          ))}
        </ResponsiveGrid>
      </div>
    </section>
  );
}
