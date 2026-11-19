import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const shopLinks = [
  { href: "/products", label: "সকল পণ্য" },
  { href: "/collections", label: "সংগ্রহ" },
  { href: "/products?sort=newest", label: "নতুন আগমন" },
  { href: "/orders", label: "অর্ডার ট্র্যাক" },
];

const infoLinks = [
  { href: "/faq", label: "প্রশ্নোত্তর" },
  { href: "/contact", label: "যোগাযোগ" },
  { href: "/privacy", label: "গোপনীয়তা নীতি" },
  { href: "/terms", label: "শর্তাবলী" },
];

const socialDefaults = {
  instagram: "https://www.instagram.com/roshpolli",
  facebook: "https://www.facebook.com/roshpolli",
  twitter: "https://twitter.com/roshpolli_bd",
};

const DUMMY_ADDRESS = "ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ";
const DUMMY_EMAIL = "hello@roshpolli.com";
const DUMMY_PHONE_DISPLAY = "+880 1700-000000";
const DUMMY_PHONE_HREF = "tel:+8801700000000";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

export default function StoreFooter({ settings = {} }) {
  const storedSocials = settings.socialLinks || {};
  const socials = {
    instagram: storedSocials.instagram || socialDefaults.instagram,
    facebook: storedSocials.facebook || socialDefaults.facebook,
    twitter: storedSocials.twitter || socialDefaults.twitter,
  };

  const storedAddress = (settings.address || "").trim();
  const address = storedAddress.length >= 12 ? storedAddress : DUMMY_ADDRESS;
  const email = (settings.supportEmail || "").trim() || DUMMY_EMAIL;
  const storedPhone = (settings.supportPhone || "").trim();
  const phoneDisplay = storedPhone || DUMMY_PHONE_DISPLAY;
  const phoneHref = storedPhone ? `tel:${storedPhone}` : DUMMY_PHONE_HREF;

  const socialItems = [
    { key: "instagram", href: socials.instagram, label: "ইনস্টাগ্রাম", icon: <InstagramIcon /> },
    { key: "facebook", href: socials.facebook, label: "ফেসবুক", icon: <FacebookIcon /> },
    { key: "twitter", href: socials.twitter, label: "টুইটার", icon: <TwitterIcon /> },
  ];

  return (
    <footer className="store-footer">
      <div className="site-container store-footer__main">
        <div className="footer-brand-column">
          <Link href="/" className="brand-mark brand-mark--footer">
            <span className="brand-mark__name">{settings.brandName || "রসপল্লী"}</span>
            <span className="brand-mark__caption">{settings.brandDescriptor || "কেজুর গুর ও রসের ঠিকানা"}</span>
          </Link>
          <p>{settings.tagline || "শীতের মিষ্টি, প্রাকৃতিক রস"}</p>
          <div className="footer-socials">
            {socialItems.map((item) => (
              <a key={item.key} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-link-column">
          <h2>কেনাকাটা</h2>
          <ul>{shopLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
        </div>

        <div className="footer-link-column">
          <h2>তথ্য</h2>
          <ul>{infoLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
        </div>

        <div className="footer-contact-column">
          <h2>যোগাযোগ</h2>
          <p><MapPin aria-hidden="true" />{address}</p>
          <a href={phoneHref}><Phone aria-hidden="true" />{phoneDisplay}</a>
          <a href={`mailto:${email}`}><Mail aria-hidden="true" />{email}</a>
          {settings.whatsapp ? (
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" />হোয়াটসঅ্যাপ
            </a>
          ) : null}
        </div>
      </div>

      <div className="site-container store-footer__bottom">
        <span>© {new Date().getFullYear()} {settings.brandName || "রসপল্লী"}. সর্বস্বত্ব সংরক্ষিত।</span>
        <span>ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি</span>
        <span>বাংলাদেশের মাটি থেকে যত্নে সাজানো</span>
      </div>
    </footer>
  );
}
