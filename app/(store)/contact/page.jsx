import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact/contact-form";
import { getSiteSettings } from "@/lib/storefront-data";

export const metadata = {
  title: "যোগাযোগ | রসপল্লী",
  description: "রসপল্লী-র সঙ্গে যোগাযোগ করুন।",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <section className="page-shell site-container">
      <div className="page-title-block"><span className="eyebrow">আমরা পাশে আছি</span><h1>যোগাযোগ করুন</h1><p>পণ্য, উপহার বা অর্ডার সংক্রান্ত প্রশ্ন থাকলে আমাদের জানান।</p></div>
      <div className="contact-layout">
        <div className="contact-card"><span className="eyebrow eyebrow--gold">রসপল্লী</span><h2>আপনার কথা শুনতে চাই</h2><p>পণ্য, ডেলিভারি বা অর্ডার সংক্রান্ত যেকোনো প্রশ্ন আমাদের জানান।</p>
          {settings.supportPhone ? <a href={`tel:${settings.supportPhone}`}><Phone aria-hidden="true" />{settings.supportPhone}</a> : null}
          {settings.supportEmail ? <a href={`mailto:${settings.supportEmail}`}><Mail aria-hidden="true" />{settings.supportEmail}</a> : null}
          {settings.address ? <p><MapPin aria-hidden="true" />{settings.address}</p> : null}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}