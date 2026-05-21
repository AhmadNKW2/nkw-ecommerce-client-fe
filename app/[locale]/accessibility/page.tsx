import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("accessibility");
}

export default function AccessibilityPage() {
  return <FooterRoutePage pageKey="accessibility" />;
}
