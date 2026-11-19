"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, BadgeCheck, RefreshCcw, Star, Truck } from "lucide-react";
import { useRef } from "react";
import { formatPrice } from "@/lib/format";

export default function HeroSection({ hero, product }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 78]);
  const productImage = product?.images?.[0] || "/images/collection-misti.svg";
  const topNote = product?.notes?.top?.[0];

  return (
    <section className="hero-section" ref={sectionRef}>
      <motion.div className="hero-section__image-wrap" style={{ y: imageY }}>
        <Image src={hero.image} alt="রসপল্লী-র নির্বাচিত কেজুর গুর ও রসের শিল্পিত উপস্থান" fill priority sizes="100vw" className="hero-section__image" />
      </motion.div>
      <div className="hero-section__overlay" />
      <div className="hero-section__glow" aria-hidden="true" />
      <div className="site-container hero-section__content">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow eyebrow--gold">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p className="hero-copy__description">{hero.subtitle}</p>
          <div className="hero-actions">
            <Link className="button button--gold" href={hero.primaryHref}>{hero.primaryLabel}<ArrowRight aria-hidden="true" /></Link>
            <Link className="text-link text-link--light" href={hero.secondaryHref}>{hero.secondaryLabel}</Link>
          </div>
          <ul className="hero-trust">
            <li><BadgeCheck aria-hidden="true" />১০০% প্রাকৃতিক</li>
            <li><Truck aria-hidden="true" />৩–৭ দিন ডেলিভারি</li>
            <li><RefreshCcw aria-hidden="true" />৭ দিন রিটার্ন</li>
          </ul>
        </motion.div>

        {product ? (
          <div className="hero-floats">
            <motion.div
              className="hero-float"
              initial={{ opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-float__inner hero-float__inner--a">
                <span className="hero-chip">
                  {product.ratingCount > 0 ? (
                    <><Star fill="currentColor" aria-hidden="true" />{product.ratingAverage} · {product.ratingCount} রিভিউ</>
                  ) : (
                    <>নতুন আগমন · সীমিত সংগ্রহ</>
                  )}
                </span>
              </div>
            </motion.div>
            <motion.div
              className="hero-float"
              initial={{ opacity: 0, y: 38 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-float__inner hero-float__inner--b">
                <article className="hero-card">
                  <div className="hero-card__media">
                    <Image src={productImage} alt={`${product.name} পণ্যের প্যাকেট`} fill sizes="150px" />
                  </div>
                  <div className="hero-card__body">
                    <span className="hero-card__cat">{product.categoryName}</span>
                    <Link href={`/products/${product.slug}`} className="hero-card__name">{product.name}</Link>
                    <div className="hero-card__price">
                      <strong>{formatPrice(product.price)}</strong>
                      {product.compareAtPrice ? <del>{formatPrice(product.compareAtPrice)}</del> : null}
                    </div>
                    {topNote ? <span className="hero-card__note">শুরুর স্বাদ · {topNote}</span> : null}
                    <Link href={`/products/${product.slug}`} className="hero-card__link">বিস্তারিত দেখুন<ArrowRight aria-hidden="true" /></Link>
                  </div>
                </article>
              </div>
            </motion.div>
          </div>
        ) : null}
      </div>
      <div className="hero-section__bottom site-container" aria-hidden="true">
        <span>ঢাকা · বাংলাদেশ</span>
        <span className="hero-scroll"><ArrowDown /> নিচে আবিষ্কার করুন</span>
        <span>০১ — ০৪</span>
      </div>
      <div className="hero-section__grain" aria-hidden="true" />
    </section>
  );
}
