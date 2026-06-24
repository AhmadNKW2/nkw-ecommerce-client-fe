"use client";

import Script from "next/script";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const GA_MEASUREMENT_ID = "G-L5CKSLWKWV";

export function GoogleAnalytics() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const targetElement = target.closest('*');
      if (!(targetElement instanceof HTMLElement)) {
        return;
      }

      const interactive = target.closest(
        'a, button, input, select, textarea, label, summary, [role], [tabindex], [data-testid], [data-analytics-id], [data-track-click]'
      );
      const interactiveElement = interactive instanceof HTMLElement ? interactive : targetElement;

      const targetText = targetElement.textContent?.replace(/\s+/g, ' ').trim();
      const interactiveText = interactiveElement.textContent?.replace(/\s+/g, ' ').trim();
      const role = interactiveElement.getAttribute('role') || targetElement.getAttribute('role');
      const href = interactiveElement instanceof HTMLAnchorElement
        ? interactiveElement.getAttribute('href')
        : targetElement.closest('a')?.getAttribute('href');
      const inputType = interactiveElement instanceof HTMLInputElement ? interactiveElement.type : undefined;
      const inputName = interactiveElement instanceof HTMLInputElement || interactiveElement instanceof HTMLSelectElement || interactiveElement instanceof HTMLTextAreaElement
        ? interactiveElement.name || undefined
        : undefined;
      const analyticsId = interactiveElement.getAttribute('data-analytics-id') || interactiveElement.getAttribute('data-testid');
      const ariaLabel = interactiveElement.getAttribute('aria-label') || targetElement.getAttribute('aria-label');
      const landmark = target.closest('header, nav, main, aside, footer, form, section, dialog');
      const sectionName = landmark instanceof HTMLElement
        ? landmark.getAttribute('aria-label') || landmark.tagName.toLowerCase()
        : undefined;
      const rect = interactiveElement.getBoundingClientRect();

      trackEvent('ui_click', {
        element_type: interactiveElement.tagName.toLowerCase(),
        element_label:
          ariaLabel ||
          interactiveElement.getAttribute('title') ||
          interactiveText ||
          targetText ||
          interactiveElement.tagName.toLowerCase(),
        target_type: targetElement.tagName.toLowerCase(),
        target_label: targetText || undefined,
        target_role: role,
        input_type: inputType,
        input_name: inputName,
        analytics_id: analyticsId,
        section_name: sectionName,
        href,
        page_path: window.location.pathname,
        click_x: Math.round(event.clientX),
        click_y: Math.round(event.clientY),
        element_top: Math.round(rect.top),
        element_left: Math.round(rect.left),
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
