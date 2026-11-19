import Image from "next/image";
import Link from "next/link";
import MotionReveal from "@/components/home/motion-reveal";
import { getHomePageData } from "@/lib/storefront-data";

export const metadata = {
  title: "রসপল্লী-র গল্প | রসপল্লী",
  description: "রসপল্লী-র প্রাকৃতিক কেজুর গুর ও রস তৈরির যাত্রা, উপাদানের প্রতি শ্রদ্ধা এবং মৌসুমের গল্প জানুন।",
};

export default async function AboutPage() {
  const { brandStory } = await getHomePageData();
  return (
    <>
      <section className="site-container about-hero">
        <MotionReveal className="about-hero__copy">
          <span className="eyebrow">রসপল্লী-র গল্প</span>
          <h1>আগুনের ধোঁয়ায়<br />মিষ্টির নিজস্ব ঠিকানা</h1>
          <p>{brandStory.body}</p>
          <p>আমাদের কাছে কেজুর গুর কেবল একটি মিষ্টি নয় — এটি মৌসুম, মাটি ও কৃষকের হাতের এক নীরব গল্প। প্রতিটি কড়ায় আমরা রাখি প্রাকৃতিক রস, যত্ন এবং খাঁটি স্বাদ ধরে রাখার অঙ্গীকার।</p>
          <Link className="button button--dark" href="/products">রসপল্লী-র সংগ্রহ দেখুন</Link>
        </MotionReveal>
        <MotionReveal className="about-hero__image" delay={0.08}><Image src={brandStory.image} alt="কেজুর গুর তৈরির খোলা কড়া ও আগুনের সম্পাদকীয় ছবি" fill priority sizes="(max-width: 760px) 100vw, 48vw" /></MotionReveal>
      </section>
      <section className="section section--paper">
        <div className="site-container about-values">
          <div><span className="eyebrow">আমাদের নীতি</span><h2>সহজ উপাদানে, গভীর স্বাদে</h2></div>
          <div className="about-values__copy"><p>প্রতিটি মৌসুমে একটি স্পষ্ট ভাবনা থাকে। কৃত্রিম উপাদানের বদলে আমরা বেছে নিই টাটা কেজুর রস, নিয়মমতো জ্বালানো আগুন এবং এমন এক স্বাদ — যা আপনার সঙ্গে থাকে, আপনার হয়ে অতিরিক্ত কিছু বলে না।</p><p>রসপল্লী-র সংগ্রহ ছোট ও মনোযোগী রাখার উদ্দেশ্য একটাই: প্রতিটি পণ্য যেন নিজের মাটি, নিজের মৌসুম নিয়ে আসে।</p></div>
        </div>
      </section>
      <section className="section site-container about-cta">
        <span className="eyebrow">আপনার রান্নাঘরের জন্য</span><h2>কোন স্বাদটি আপনার?</h2><p>মৌসুম, ব্যবহার ও পছন্দ অনুযায়ী রসপল্লী-র সংগ্রহ থেকে খুঁজে নিন আপনার পরবর্তী প্রিয় মিষ্টি।</p><Link className="text-link" href="/products">সকল পণ্য আবিষ্কার করুন</Link>
      </section>
    </>
  );
}
