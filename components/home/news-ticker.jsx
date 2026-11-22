import Link from "next/link";
import { ArrowRight, Droplets, Flame, ShieldCheck, Snowflake, Sparkles, Truck } from "lucide-react";

const updates = [
  { icon: Snowflake, text: "শীতের আয়োজন শুরু — খাঁটি খেজুরের গুড়" },
  { icon: Droplets, text: "তাজা খেজুরের রস ও নলেন গুড় স্টকে" },
  { icon: Flame, text: "নরম পাটালি — পিঠা ও পায়েসের সঙ্গী" },
  { icon: Truck, text: "ক্যাশ অন ডেলিভারি সুবিধা" },
  { icon: ShieldCheck, text: "সারা বাংলাদেশে যত্নসহকারে ডেলিভারি" },
  { icon: Sparkles, text: "নতুন সংগ্রহ — গুরের মিষ্টির বিশেষ সিরিজ" },
];

export default function NewsTicker() {
  return (
    <div className="news-ticker" role="region" aria-label="রসপল্লীর খবর ও আপডেট">
      <div className="news-ticker__label">
        <span className="news-ticker__live" aria-hidden="true" />
        <span>নিউজ</span>
      </div>
      <div className="news-ticker__viewport">
        <div className="news-ticker__track">
          {[0, 1].map((copy) => (
            <div className="news-ticker__group" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>
              {updates.map(({ icon: Icon, text }) => (
                <span className="news-ticker__item" key={text}>
                  <Icon className="news-ticker__icon" aria-hidden="true" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Link className="news-ticker__cta" href="/products">
        দেখুন <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
}
