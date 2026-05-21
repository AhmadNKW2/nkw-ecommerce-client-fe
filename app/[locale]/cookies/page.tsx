import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("cookies");
}

export default function CookiesPage() {
  return <FooterRoutePage pageKey="cookies" />;
}
