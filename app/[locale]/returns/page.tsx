import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("returns");
}

export default function ReturnsPage() {
  return <FooterRoutePage pageKey="returns" />;
}
