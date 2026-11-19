"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Heart, Plus, Star } from "lucide-react";
import { formatPrice, percentOff } from "@/lib/format";
import { getDefaultProductSize } from "@/lib/product-utils";
import { useStorefront } from "@/components/store/storefront-provider";

function ProductImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={`product-image-fallback ${className}`} aria-label={alt}><span>রসপল্লী</span></div>;
  }
  return <Image src={src || "/images/collection-misti.svg"} alt={alt} fill sizes="(max-width: 620px) 48vw, (max-width: 1024px) 31vw, 24vw" className={className} onError={() => setFailed(true)} />;
}

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, wishlistIds } = useStorefront();
  const productId = product._id || product.id || product.slug;
  const image = product.images?.[0] || "/images/collection-misti.svg";
  const discount = percentOff(product.price, product.compareAtPrice);
  const isWishlisted = wishlistIds.includes(productId);
  const defaultSize = getDefaultProductSize(product);
  const hasStock = !defaultSize || Number(defaultSize.stock ?? 1) > 0;
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  function addDefaultSize() {
    if (!hasStock || added) return;
    addToCart(product, defaultSize, 1);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1800);
  }

  const addLabel = !hasStock ? "স্টকে নেই" : added ? "কার্টে যোগ হয়েছে" : `${product.name} কার্টে যোগ করুন`;

  return (
    <article className="product-card" style={{ "--card-index": index }}>
      <div className="product-card__media">
        <Link href={`/products/${product.slug}`} className="product-card__image-link" aria-label={`${product.name} দেখুন`}>
          <ProductImage src={image} alt={`${product.name} পণ্যের প্যাকেট`} className="product-card__image" />
        </Link>
        <div className="product-card__badges">
          {discount ? <span className="product-badge product-badge--gold">-{discount}%</span> : null}
          {product.isNewArrival ? <span className="product-badge">নতুন</span> : null}
          {!hasStock ? <span className="product-badge product-badge--muted">স্টক নেই</span> : null}
        </div>
        <button
          className={`product-card__wishlist${isWishlisted ? " is-active" : ""}`}
          type="button"
          aria-label={isWishlisted ? "ইচ্ছেতালিকা থেকে সরান" : "ইচ্ছেতালিকায় যোগ করুন"}
          aria-pressed={isWishlisted}
          onClick={() => toggleWishlist(productId)}
        >
          <Heart aria-hidden="true" />
        </button>
        <div className="product-card__quick-actions">
          <button
            className={`product-card__add${added ? " is-added" : ""}`}
            type="button"
            onClick={addDefaultSize}
            disabled={!hasStock}
            aria-label={addLabel}
          >
            {added ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            <span>{!hasStock ? "স্টক নেই" : added ? "যোগ হয়েছে" : "কার্টে যোগ"}</span>
          </button>
        </div>
      </div>
      <div className="product-card__info">
        <div className="product-card__meta">
          <span>{product.categoryName}</span>
          {product.ratingCount > 0 ? (
            <span className="product-rating"><Star fill="currentColor" aria-hidden="true" />{product.ratingAverage} ({product.ratingCount})</span>
          ) : product.isNewArrival ? (
            <span className="product-new-note">নতুন আগমন</span>
          ) : null}
        </div>
        <Link href={`/products/${product.slug}`} className="product-card__name">{product.name}</Link>
        {product.tagline ? <p className="product-card__tagline">{product.tagline}</p> : null}
        <p className="product-card__desc">{product.shortDescription || product.description}</p>
        <div className="product-card__price">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAtPrice ? <del>{formatPrice(product.compareAtPrice)}</del> : null}
          {product.sizes?.length > 1 ? <span className="product-card__variants">{product.sizes.length}টি সাইজ</span> : null}
        </div>
      </div>
    </article>
  );
}
