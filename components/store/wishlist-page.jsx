"use client";

import Link from "next/link";
import ProductCard from "@/components/products/product-card";
import { EmptyWishlist } from "@/components/states";
import { useStorefront } from "@/components/store/storefront-provider";

export default function WishlistPage({ products }) {
  const { wishlistIds } = useStorefront();
  const saved = products.filter((product) => wishlistIds.includes(product._id || product.id || product.slug));

  return (
    <section className="page-shell site-container">
      <div className="page-title-block"><span className="eyebrow">আপনার পছন্দ</span><h1>ইচ্ছেতালিকা</h1><p>পরে ফিরে দেখার জন্য রাখা পণ্যগুলো।</p></div>
      {saved.length ? <div className="product-grid">{saved.map((product, index) => <ProductCard product={product} index={index} key={product.id || product._id} />)}</div> : <EmptyWishlist />}
    </section>
  );
}
