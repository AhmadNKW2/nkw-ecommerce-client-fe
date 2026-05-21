import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("terms");
}

export default function TermsPage() {
  return <FooterRoutePage pageKey="terms" />;
}
