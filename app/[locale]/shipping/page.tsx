import { FooterRoutePage, generateFooterPageMetadata } from "@/components/footer-pages/footer-route-page";

export async function generateMetadata() {
  return generateFooterPageMetadata("shipping");
}

export default function ShippingPage() {
  return <FooterRoutePage pageKey="shipping" />;
}
