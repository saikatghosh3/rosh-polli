import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Star } from "lucide-react";
import ProductGallery from "@/components/products/product-gallery";
import ProductPurchasePanel from "@/components/products/product-purchase-panel";
import ProductRail from "@/components/products/product-rail";
import ReviewForm from "@/components/products/review-form";
import MotionReveal from "@/components/home/motion-reveal";
import { getProductBySlug, getProductReviews, getRelatedProducts, isStoreDemoMode } from "@/lib/storefront-data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "পণ্য পাওয়া যায়নি | রসপল্লী" };
  return {
    title: `${product.name} | রসপল্লী`,
    description: product.description,
    openGraph: { title: `${product.name} | রসপল্লী`, description: product.description, images: product.images?.[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [relatedProducts, reviews, demoMode] = await Promise.all([
    getRelatedProducts(product, 8),
    getProductReviews(product.id || product._id),
    isStoreDemoMode(),
  ]);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: product.brand || "রসপল্লী" },
    offers: { "@type": "Offer", priceCurrency: "BDT", price: product.price, availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="site-container product-detail">
        <nav className="breadcrumbs" aria-label="আপনি এখন এখানে"><Link href="/">হোম</Link><span aria-hidden="true">/</span><Link href="/products">পণ্য</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
        <div className="product-detail__layout">
          <ProductGallery product={product} />
          <div className="product-detail__copy">
            <span className="eyebrow">{product.categoryName}</span>
            <h1>{product.name}</h1>
            <p className="product-detail__tagline">{product.tagline}</p>
            {product.ratingCount > 0 ? <div className="product-detail__rating"><Star fill="currentColor" aria-hidden="true" />{product.ratingAverage} · {product.ratingCount}টি রিভিউ</div> : <p className="product-detail__rating-note">রসপল্লী-র নির্বাচিত পণ্য</p>}
            <p className="product-detail__description">{product.description}</p>
            <ProductPurchasePanel product={product} />
            <p className="product-detail__shipping">ডেলিভারির সময়সূচি ও চার্জ চেকআউটের আগে জানানো হবে।</p>
          </div>
        </div>
      </section>

      <section className="product-notes-section">
        <div className="site-container product-notes-layout">
          <MotionReveal className="product-notes-copy"><span className="eyebrow">স্বাদের স্তর</span><h2>খাওয়ার সাথে সাথে থেকে যাওয়া এক অনুভব</h2><p>শুরুর স্বাদ থেকে শেষের মিষ্টি রেশ—এই পণ্যের প্রতিটি স্তর ধীরে ধীরে প্রকাশিত হয়।</p></MotionReveal>
          <div className="notes-grid">
            {[ ["শুরুর স্বাদ", product.notes?.top], ["মাঝের স্বাদ", product.notes?.middle], ["শেষের স্বাদ", product.notes?.base] ].map(([title, notes], index) => <article className="note-card" key={title}><span>০{index + 1}</span><h3>{title}</h3><p>{notes?.length ? notes.join(" · ") : "স্বাদ শিগগিরই যোগ হবে"}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section site-container review-section">
        <div className="section-heading"><div className="section-heading__copy"><span className="eyebrow">ক্রেতাদের মতামত</span><h2>অভিজ্ঞতা ভাগ করুন</h2><p>আপনার মতামত অন্যদের পণ্য বেছে নিতে সাহায্য করে।</p></div></div>
        <div className="review-layout">
          <div className="review-list">{reviews.length ? reviews.map((review) => <article className="review-card" key={review._id || review.id}><div className="review-card__stars" aria-label={`${review.rating} তারকা`}>{Array.from({ length: review.rating }, (_, index) => <Star key={index} fill="currentColor" aria-hidden="true" />)}</div><p>{review.comment}</p><strong>{review.name}</strong></article>) : <div className="quiet-empty">এখনো কোনো যাচাইকৃত রিভিউ নেই। প্রথম মতামতটি আপনিই দিন।</div>}</div>
          <div className="review-form-card"><h3>আপনার অভিজ্ঞতা লিখুন</h3><ReviewForm productId={product.id || product._id} demoMode={demoMode} /></div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="section section--paper" aria-labelledby="related-products-title">
          <div className="site-container">
            <div className="section-heading">
              <div className="section-heading__copy">
                <span className="eyebrow">সম্পর্কিত পণ্য</span>
                <h2 id="related-products-title">এই পণ্যের সঙ্গে যা ভালো লাগবে</h2>
                <p>একই স্বাদ ও ঋতুর পণ্য — প্রতিটির সংক্ষিপ্ত বিবরণ দেখে পছন্দেরটি বেছে নিন।</p>
              </div>
              {product.categorySlug ? <Link className="text-link section-heading__link" href={`/collections/${product.categorySlug}`}>সব {product.categoryName || "সংগ্রহ"} দেখুন</Link> : null}
            </div>
            <ProductRail products={relatedProducts} label={`${product.name}-এর সম্পর্কিত পণ্য`} />
          </div>
        </section>
      ) : null}
    </>
  );
}
