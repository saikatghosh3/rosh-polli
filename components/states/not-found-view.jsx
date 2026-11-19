import Link from "next/link";

const helpLinks = [
  { href: "/faq", label: "সাধারণ প্রশ্নোত্তর" },
  { href: "/orders", label: "অর্ডার ট্র্যাক করুন" },
  { href: "/contact", label: "যোগাযোগ করুন" },
  { href: "/products", label: "সকল পণ্য দেখুন" },
];

export default function NotFoundView({ standalone = false, framed = false, categories = [], products = [] }) {
  const popularCategories = categories.slice(0, 6);
  const popularProducts = products.slice(0, 4);
  const sectionClass = standalone
    ? "notfound-page notfound-page--root"
    : framed
      ? "notfound-page notfound-page--framed"
      : "page-shell notfound-page";

  return (
    <section className={sectionClass}>
      <div className="site-container notfound-page__inner">
        <div className="notfound-copy">
          <span className="eyebrow">ভুল ঠিকানা</span>
          <span className="notfound-code" aria-hidden="true">404</span>
          <h1>এই পৃষ্ঠাটি খুঁজে পাওয়া গেল না</h1>
          <p>
            ঠিকানাটি হয়তো সরে গেছে, অথবা কোনো ভুল লেখা হয়েছে। চিন্তা করবেন না — আপনার পছন্দের পণ্য খুঁজে নেওয়ার
            জন্য নিচের সূত্রগুলো পাশেই আছে।
          </p>

          <form className="notfound-search" action="/products" method="get" role="search">
            <label className="sr-only" htmlFor="notfound-q">পণ্য খুঁজুন</label>
            <input id="notfound-q" type="search" name="q" placeholder="পণ্য, গুর, রস বা মিষ্টি লিখুন…" autoComplete="off" />
            <button className="button button--dark" type="submit">খুঁজুন</button>
          </form>

          <div className="notfound-actions">
            <Link className="button button--gold" href="/">হোমে ফিরুন</Link>
            <Link className="button button--outline" href="/collections">সংগ্রহ দেখুন</Link>
          </div>
        </div>

        <div className="notfound-panel">
          {popularCategories.length ? (
            <div className="notfound-group">
              <h2>জনপ্রিয় সংগ্রহ</h2>
              <ul>
                {popularCategories.map((category) => (
                  <li key={category.id || category.slug}>
                    <Link href={`/collections/${category.slug}`}>
                      {category.name}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {popularProducts.length ? (
            <div className="notfound-group">
              <h2>জনপ্রিয় পণ্য</h2>
              <ul>
                {popularProducts.map((product) => (
                  <li key={product.id || product.slug}>
                    <Link href={`/products/${product.slug}`}>
                      {product.name}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="notfound-group">
            <h2>সাহায্য ও তথ্য</h2>
            <ul>
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
