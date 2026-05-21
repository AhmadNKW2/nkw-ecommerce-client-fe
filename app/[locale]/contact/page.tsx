import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("contact");
}

export default function ContactPage() {
  return <FooterRoutePage pageKey="contact" />;
}
