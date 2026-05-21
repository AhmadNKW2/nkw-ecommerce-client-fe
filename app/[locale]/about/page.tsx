import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("about");
}

export default function AboutPage() {
  return <FooterRoutePage pageKey="about" />;
}
