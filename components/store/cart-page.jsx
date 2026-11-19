"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { EmptyCart } from "@/components/states";
import { useStorefront } from "@/components/store/storefront-provider";

export default function CartPage({ deliveryDhaka = 80, deliveryOutside = 80, freeDeliveryThreshold = 3000, demoMode = true }) {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart } = useStorefront();
  const isFree = cartSubtotal >= freeDeliveryThreshold;
  const dhakaDelivery = isFree ? 0 : deliveryDhaka;
  const outsideDelivery = isFree ? 0 : deliveryOutside;
  const showBothTotals = dhakaDelivery !== outsideDelivery;

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <section className="page-shell site-container cart-page">
      <div className="page-title-block"><span className="eyebrow">আপনার নির্বাচন</span><h1>শপিং কার্ট</h1><p>{cartItems.length} ধরনের পণ্য, {cartItems.reduce((sum, item) => sum + item.quantity, 0)}টি প্যাকেট</p></div>
      {demoMode ? <div className="demo-notice" role="status">ডেমো কার্টটি শুধু এই পেজ সেশনে থাকে। অর্ডার জমা ও সংরক্ষণ ডেটাবেস সংযোগের পর চালু হবে।</div> : null}
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <article className="cart-item" key={`${item.productId}-${item.size}`}>
              <Link href={`/products/${item.slug}`} className="cart-item__image"><Image src={item.image} alt={`${item.name} পণ্য`} fill sizes="120px" /></Link>
              <div className="cart-item__details"><span className="eyebrow">রসপল্লী</span><Link href={`/products/${item.slug}`} className="cart-item__name">{item.name}</Link><p>{item.size}</p><strong>{formatPrice(item.price)}</strong></div>
              <div className="cart-item__quantity"><div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} aria-label={`${item.name} একটি কমান`}><Minus aria-hidden="true" /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} aria-label={`${item.name} একটি বাড়ান`}><Plus aria-hidden="true" /></button></div><button className="cart-item__remove" type="button" onClick={() => removeFromCart(item.productId, item.size)} aria-label={`${item.name} কার্ট থেকে সরান`}><Trash2 aria-hidden="true" /><span>সরান</span></button></div>
              <strong className="cart-item__total">{formatPrice(item.price * item.quantity)}</strong>
            </article>
          ))}
          <Link className="text-link cart-continue" href="/products">← আরও পণ্য দেখুন</Link>
        </div>
        <aside className="cart-summary" aria-labelledby="cart-summary-title">
          <h2 id="cart-summary-title">অর্ডারের সারাংশ</h2>
          <div><span>সাবটোটাল</span><strong>{formatPrice(cartSubtotal)}</strong></div>
          <div><span>ডেলিভারি — ঢাকার ভিতরে</span><strong>{dhakaDelivery ? formatPrice(dhakaDelivery) : "বিনামূল্যে"}</strong></div>
          <div><span>ডেলিভারি — ঢাকার বাইরে</span><strong>{outsideDelivery ? formatPrice(outsideDelivery) : "বিনামূল্যে"}</strong></div>
          <p className="cart-summary__hint">{isFree ? "আপনার অর্ডারে ডেলিভারি চার্জ নেই।" : `${formatPrice(freeDeliveryThreshold - cartSubtotal)} বেশি কেনাকাটায় ডেলিভারি বিনামূল্যে।`}</p>
          <div className="cart-summary__total"><span>{showBothTotals ? "সর্বমোট (ঢাকার ভিতরে)" : "সর্বমোট"}</span><strong>{formatPrice(cartSubtotal + dhakaDelivery)}</strong></div>
          {showBothTotals ? <div className="cart-summary__total"><span>সর্বমোট (ঢাকার বাইরে)</span><strong>{formatPrice(cartSubtotal + outsideDelivery)}</strong></div> : null}
          <Link href="/checkout" className="button button--dark cart-summary__checkout">চেকআউটে এগিয়ে যান</Link>
          {demoMode ? <p className="cart-summary__disclaimer">ডেমো মোডে চেকআউট প্রিভিউ দেখা যাবে; অর্ডার জমা হবে না।</p> : null}
        </aside>
      </div>
    </section>
  );
}
