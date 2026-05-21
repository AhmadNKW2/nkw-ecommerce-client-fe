import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("privacy");
}

export default function PrivacyPage() {
  return <FooterRoutePage pageKey="privacy" />;
}
