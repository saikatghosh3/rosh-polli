"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import StoreSelect from "@/components/ui/store-select";
import { formatPrice } from "@/lib/format";
import { getDefaultProductSize } from "@/lib/product-utils";
import { useStorefront } from "@/components/store/storefront-provider";

export default function ProductPurchasePanel({ product }) {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const defaultSize = getDefaultProductSize(product) || sizes[0] || { label: "স্ট্যান্ডার্ড", price: product.price, stock: product.stock || 0 };
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleWishlist, wishlistIds } = useStorefront();
  const productId = product._id || product.id || product.slug;
  const isWishlisted = wishlistIds.includes(productId);
  const stock = Number(selectedSize.stock ?? product.stock ?? 0);

  return (
    <div className="purchase-panel">
      <div className="purchase-panel__price"><strong>{formatPrice(selectedSize.price)}</strong>{product.compareAtPrice ? <del>{formatPrice(product.compareAtPrice)}</del> : null}</div>
      <p className="purchase-panel__availability">{stock > 0 ? "স্টকে রয়েছে" : "এই মাপটি আপাতত শেষ"}</p>
      <label className="field-label" htmlFor="product-size">পরিমাণ</label>
      <StoreSelect
        id="product-size"
        ariaLabel="পরিমাণ"
        value={selectedSize.label}
        onChange={(label) => {
          const next = sizes.find((size) => size.label === label);
          if (next) {
            setSelectedSize(next);
            setQuantity((current) => Math.min(current, Math.max(1, next.stock)));
          }
        }}
        options={sizes.map((size) => ({ value: size.label, label: `${size.label} · ${formatPrice(size.price)}` }))}
      />
      <div className="purchase-panel__actions">
        <div className="quantity-control" aria-label="পণ্যের পরিমাণ">
          <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="একটি কমান"><Minus aria-hidden="true" /></button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" onClick={() => setQuantity((current) => Math.min(Math.max(stock, 1), current + 1))} aria-label="একটি বাড়ান"><Plus aria-hidden="true" /></button>
        </div>
        <button className="button button--dark purchase-panel__add" type="button" disabled={stock < 1} onClick={() => addToCart(product, selectedSize, quantity)}><ShoppingBag aria-hidden="true" />কার্টে যোগ করুন</button>
        <button className={`icon-button purchase-panel__wish${isWishlisted ? " is-active" : ""}`} type="button" aria-label={isWishlisted ? "ইচ্ছেতালিকা থেকে সরান" : "ইচ্ছেতালিকায় যোগ করুন"} aria-pressed={isWishlisted} onClick={() => toggleWishlist(productId)}><Heart aria-hidden="true" /></button>
      </div>
      <div className="purchase-panel__details"><p><span>ব্র্যান্ড</span><strong>{product.brand || "রসপল্লী"}</strong></p><p><span>ধরন</span><strong>{product.categoryName}</strong></p><p><span>স্বাদের ধরন</span><strong>{product.tagline}</strong></p></div>
    </div>
  );
}
