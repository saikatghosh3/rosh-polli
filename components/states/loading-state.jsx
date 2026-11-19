"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function PageLoading({ message = "পণ্য লোড হচ্ছে, অপেক্ষা করুন..." }) {
  return (
    <section className="page-loading page-shell site-container" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-center">
        <Loader2 className="loading-spinner" aria-hidden="true" />
        <span className="loading-message">{message}</span>
      </div>
      <div className="loading-skeletons">
        <div className="skeleton skeleton--text skeleton--wide" />
        <div className="skeleton skeleton--text skeleton--wide" />
        <div className="skeleton skeleton--text" />
        <div className="skeleton skeleton--image" />
        <div className="skeleton skeleton--image" />
        <div className="skeleton skeleton--image" />
        <div className="skeleton skeleton--image" />
      </div>
    </section>
  );
}

export function SectionLoading({ message }) {
  return (
    <div className="section-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-skeletons">
        <div className="skeleton skeleton--text skeleton--wide" />
        <div className="skeleton skeleton--text skeleton--wide" />
        <div className="skeleton skeleton--text" />
        <div className="skeleton skeleton--image" />
        <div className="skeleton skeleton--image" />
        <div className="skeleton skeleton--image" />
      </div>
    </div>
  );
}

export function ButtonLoading({ children }) {
  return (
    <button type="button" className="button button--dark" disabled aria-busy="true" aria-label="লোড হচ্ছে">
      <span className="loading-spinner--small" aria-hidden="true" />
      {children}
    </button>
  );
}

export function CardSkeleton() {
  return (
    <article className="product-card skeleton-card">
      <div className="product-card__media">
        <div className="skeleton skeleton--image" />
      </div>
      <div className="product-card__info">
        <div className="skeleton skeleton--text skeleton--meta" />
        <div className="skeleton skeleton--text skeleton--wide" />
        <div className="skeleton skeleton--text" />
        <div className="skeleton skeleton--text skeleton--price" />
      </div>
    </article>
  );
}

export function ProductGridLoading({ count = 8 }) {
  return (
    <div className="product-grid loading-grid" role="status" aria-live="polite" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => <CardSkeleton key={index} />)}
    </div>
  );
}
