import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Leaf, ShieldCheck, Star, Truck } from "lucide-react";
import CollectionGrid from "@/components/home/collection-grid";
import HeroSection from "@/components/home/hero-section";
import MotionReveal from "@/components/home/motion-reveal";
import NewsTicker from "@/components/home/news-ticker";
import ParallaxPair from "@/components/home/parallax-pair";
import ParallaxShift from "@/components/home/parallax-shift";
import ProductRail from "@/components/products/product-rail";
import { getHomePageData } from "@/lib/storefront-data";

export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <>
      <HeroSection hero={data.hero} product={data.featuredProducts?.[0]} />

      <NewsTicker />

      <section className="section site-container" aria-labelledby="collections-title">
        <div className="section-heading">
          <div className="section-heading__copy">
            <span className="eyebrow">শীত নিয়ে যা ভালোলাগে</span>
            <h2 id="collections-title">মিষ্টির নানা<br />রূপ, রসের তাজা স্বাদ</h2>
            <p>কেজুর গুর থেকে তাজা রস, গুরের মিষ্টি থেকে প্রিমিয়াম সংগ্রহ — রসপল্লী-র নির্বাচিত পণ্য।</p>
          </div>
          <Link className="text-link section-heading__link" href="/collections">সব সংগ্রহ দেখুন</Link>
        </div>
        <CollectionGrid categories={data.categories} />
      </section>

      <section className="section product-section" aria-labelledby="featured-title">
        <div className="site-container">
          <div className="section-heading">
            <div className="section-heading__copy">
              <span className="eyebrow">রসপল্লী-র স্বাক্ষর</span>
              <h2 id="featured-title">বেছে নেওয়া মিষ্টি</h2>
              <p>যেগুলো একবার খেলে মনে থেকে যায়।</p>
            </div>
            <Link className="text-link section-heading__link" href="/products">সব পণ্য দেখুন</Link>
          </div>
          <ProductRail products={data.featuredProducts} label="বেছে নেওয়া মিষ্টির স্লাইডার" hideProgress className="featured-product-rail" />
        </div>
      </section>

      <ParallaxPair>
        <section className="section site-container">
          <div className="brand-story">
            <MotionReveal className="brand-story__image-wrap">
              <ParallaxShift className="brand-story__image-shift" distance={32}>
                <Image src={data.brandStory.image} alt="রসপল্লী-র গুর তৈরির আগুন ও খোলা কড়া" fill sizes="(max-width: 760px) 100vw, 50vw" className="brand-story__image" />
              </ParallaxShift>
              <span className="brand-story__image-caption"><span aria-hidden="true">✦</span> কেজুর রস থেকে খাঁটি গুর</span>
            </MotionReveal>
            <MotionReveal className="brand-story__copy" delay={0.08}>
              <span className="eyebrow">{data.brandStory.eyebrow}</span>
              <h2>{data.brandStory.title}</h2>
              <p>{data.brandStory.body}</p>
              <Link className="button button--dark" href={data.brandStory.linkHref}>{data.brandStory.linkLabel}</Link>
            </MotionReveal>
          </div>
        </section>

        {data.promotion ? (
          <section className="promo-banner" aria-labelledby="promotion-title">
            <div className="promo-banner__image">
              <ParallaxShift className="promo-banner__image-shift" distance={38}>
                <Image src={data.promotion.image} alt={data.promotion.alt || "রসপল্লী-র নির্বাচিত পণ্য"} fill sizes="100vw" />
              </ParallaxShift>
            </div>
            <div className="promo-banner__shade" />
            <div className="promo-banner__grain" aria-hidden="true" />
            <MotionReveal className="site-container promo-banner__copy">
              <span className="eyebrow eyebrow--gold">{data.promotion.eyebrow || "রসপল্লী-র বিশেষ আয়োজন"}</span>
              <h2 id="promotion-title">{data.promotion.title}</h2>
              <p>{data.promotion.subtitle}</p>
              {data.promotion.ctaHref && data.promotion.ctaLabel ? <Link className="button button--gold" href={data.promotion.ctaHref}>{data.promotion.ctaLabel}</Link> : null}
            </MotionReveal>
          </section>
        ) : null}
      </ParallaxPair>

      <section className="section section--paper" aria-labelledby="new-arrivals-title">
        <div className="site-container">
          <div className="section-heading">
            <div className="section-heading__copy">
              <span className="eyebrow">সদ্য রসপল্লী-তে</span>
              <h2 id="new-arrivals-title">নতুন আগমন</h2>
              <p>নতুন কড়া, নতুন রস — শীতের জন্য এসেছে নতুন নতুন স্বাদ।</p>
            </div>
            <Link className="text-link section-heading__link" href="/products?sort=newest">নতুন সব পণ্য</Link>
          </div>
          <ProductRail products={data.newProducts} label="নতুন আগমনের স্লাইডার" hideProgress className="featured-product-rail" />
        </div>
      </section>

      <section className="section section--cream section--tight" aria-label="রসপল্লী-র প্রতিশ্রুতি">
        <div className="site-container promise-grid">
          <article className="promise-item"><Leaf aria-hidden="true" /><h3>প্রাকৃতিক উপাদান</h3><p>কোনো রাসায়নিক উপাদান ছাড়া, কেবল কেজুর রস ও আগুন।</p></article>
          <article className="promise-item"><BadgeCheck aria-hidden="true" /><h3>খাঁটি স্বাদ</h3><p>প্রতিটি কড়ায় কৃষকের হাতের যত্ন ও অভিজ্ঞতা।</p></article>
          <article className="promise-item"><Truck aria-hidden="true" /><h3>যত্নে পৌঁছে দেওয়া</h3><p>বাংলাদেশজুড়ে ডেলিভারির পরিকল্পনা।</p></article>
          <article className="promise-item"><ShieldCheck aria-hidden="true" /><h3>নিরাপদ অর্ডার</h3><p>অর্ডার প্রক্রিয়ায় স্বচ্ছতা ও নিশ্চয়তা।</p></article>
        </div>
      </section>

      {data.testimonials.length > 0 ? (
        <section className="section section--dark" aria-labelledby="testimonials-title">
          <div className="site-container">
            <div className="section-heading section-heading--center section-heading--light">
              <div className="section-heading__copy"><span className="eyebrow eyebrow--gold">ক্রেতাদের অনুভব</span><h2 id="testimonials-title">তাদের ভাষায় রসপল্লী</h2></div>
            </div>
            <div className="testimonial-grid">
              {data.testimonials.map((testimonial) => (
                <article className="testimonial-card" key={testimonial.id || testimonial._id}>
                  <div className="testimonial-card__stars" aria-label={`${testimonial.rating} তারকা`}>
                    {Array.from({ length: testimonial.rating }, (_, index) => <Star key={index} fill="currentColor" aria-hidden="true" />)}
                  </div>
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <cite>{testimonial.name}</cite>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.socialGallery.length > 0 ? (
        <section className="section site-container" aria-labelledby="social-title">
          <div className="section-heading section-heading--center"><div className="section-heading__copy"><span className="eyebrow">রসপল্লী-র মুহূর্ত</span><h2 id="social-title">মিষ্টির চারপাশে</h2><p>আপনার রান্নাঘরের মিষ্টির সঙ্গে রসপল্লী-র গল্প ভাগ করে নিন।</p></div></div>
          <div className="social-grid">{data.socialGallery.map((item) => <a className="social-grid__item" href={item.href} key={item.id || item.image} aria-label={item.alt}><Image src={item.image} alt={item.alt} fill sizes="25vw" /></a>)}</div>
        </section>
      ) : null}
    </>
  );
}
