"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, PackageSearch, ArrowRight } from "lucide-react";

export function NoResultsState({ query, suggestions }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = typeof params?.get("q") === "string" ? params.get("q") : query || "";

  const handleSearchAgain = useCallback((next = "") => {
    const url = new URL(window.location.origin + "/products");
    url.searchParams.set("q", next);
    router.push(url.toString());
  }, [router]);

  const handleChip = useCallback((suggestion) => {
    const url = new URL(window.location.origin + "/products");
    url.searchParams.set("q", suggestion);
    router.push(url.toString());
  }, [router]);

  return (
    <section className="no-results-state page-shell site-container" aria-labelledby="no-results-title">
      <Search aria-hidden="true" className="no-results__icon" />
      <h2 id="no-results-title" className="no-results__title">“{current}” এর কোনো ফলাফল পাওয়া যায়নি</h2>
      <p className="no-results__description">
        আমাদের সংগ্রহে এই শব্দের সাথে মেলে না। অন্য কোনো শব্দ, সংগ্রহ বা দামের ছাঁটি দিয়ে আবার খুঁজে দেখুন।
      </p>

      {suggestions && suggestions.length > 0 ? (
        <div className="no-results__suggestions">
          <span className="no-results__label">একটা চেষ্টা করে দেখতে পারেন</span>
          <div className="no-results__chips">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} className="chip chip--outline" onClick={() => handleChip(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="no-results__actions">
        <button type="button" className="button button--gold" onClick={() => handleSearchAgain("")}><Search aria-hidden="true" />আবার খোঁজা শুরু করুন</button>
        <Link className="button button--outline" href="/products">সব সংগ্রহ দেখুন</Link>
        <Link className="button button--outline" href="/">হোমে ফিরে যান</Link>
      </div>
    </section>
  );
}

export function SearchEmptySuggestions({ categories }) {
  return (
    <div className="search-suggestions section section--tight">
      <div className="site-container">
        <div className="section-heading section-heading--center"><div className="section-heading__copy"><span className="eyebrow">অবশেষে কিছু পেলেন না?</span><h2>অনুশাসিত সংগ্রহ</h2><p>নিচের সংগ্রহগুলো থেকে আপনার পণ্যটি বেছে নিতে পারেন।</p></div></div>
        <div className="product-grid">
          {categories.map((category) => (
            <article className="collection-card" key={category.slug}>
              <Link href={`/products?category=${category.slug}`} className="collection-card__link" aria-label={`${category.name} সংগ্রহ দেখুন`}>
                <div className="collection-card__shade" />
                <div className="collection-card__copy">
                  <span className="eyebrow">{category.name}</span>
                  <h3 className="collection-card__title">{category.name}</h3>
                  <p className="collection-card__description">এই ছাঁটির সব পণ্য দেখুন</p>
                </div>
                <ArrowRight className="collection-card__arrow" aria-hidden="true" size={14} strokeWidth={1.6} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
