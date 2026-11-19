"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import MotionReveal from "@/components/home/motion-reveal";

export default function CollectionGrid({ categories = [] }) {
  const railRef = useRef(null);
  const [edge, setEdge] = useState({ atStart: true, atEnd: true });

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const next = {
      atStart: rail.scrollLeft <= 4,
      atEnd: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4,
    };
    setEdge((current) => current.atStart === next.atStart && current.atEnd === next.atEnd ? current : next);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    measure();
    rail.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(rail);
    return () => {
      rail.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [categories.length, measure]);

  function scroll(direction) {
    const rail = railRef.current;
    const card = rail?.querySelector(".collection-card");
    if (!rail || !card) return;
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 14;
    rail.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  }

  return (
    <div className="collection-rail-wrap">
      <div className="collection-grid" ref={railRef} role="region" aria-roledescription="carousel" aria-label="মিষ্টির নানা রূপ, রসের তাজা স্বাদ" tabIndex={0} onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); scroll(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); scroll(-1); }
      }}>
        {categories.map((category, index) => (
          <MotionReveal key={category.slug} className={`collection-card collection-card--${index + 1}`} delay={index * 0.07} as="article">
            <Link href={"/collections/" + category.slug} className="collection-card__link" aria-label={category.name + " দেখুন"}>
              <Image src={category.image} alt={category.name + " সংগ্রহের শিল্পিত দৃশ্য"} fill sizes="(max-width: 760px) 78vw, 25vw" loading={index === 0 ? "eager" : "lazy"} className="collection-card__image" />
              <span className="collection-card__shade" />
              <span className="collection-card__copy">
                <span className="eyebrow eyebrow--light">{category.eyebrow}</span>
                <span className="collection-card__title">{category.name}</span>
                <span className="collection-card__description">{category.description}</span>
              </span>
              <span className="collection-card__cta" aria-hidden="true"><ArrowUpRight /></span>
            </Link>
          </MotionReveal>
        ))}
      </div>
      {!edge.atStart || !edge.atEnd ? (
        <div className="collection-rail-controls" aria-label="সংগ্রহ স্লাইডার নিয়ন্ত্রণ">
          <button type="button" className="icon-button rail-arrow" onClick={() => scroll(-1)} disabled={edge.atStart} aria-label="আগের সংগ্রহ"><ArrowLeft aria-hidden="true" /></button>
          <button type="button" className="icon-button rail-arrow" onClick={() => scroll(1)} disabled={edge.atEnd} aria-label="পরের সংগ্রহ"><ArrowRight aria-hidden="true" /></button>
        </div>
      ) : null}
    </div>
  );
}
