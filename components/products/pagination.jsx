import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GAP = "gap";

function buildPageWindow(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = [...new Set([1, totalPages, current - 1, current, current + 1])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const window = [];
  let previous = 0;
  for (const value of pages) {
    if (value - previous > 1) window.push(GAP);
    window.push(value);
    previous = value;
  }
  return window;
}

export function buildProductsHref(targetPage, { query = "", category = "", sort = "" } = {}) {
  const searchParams = new URLSearchParams();
  if (query) searchParams.set("q", query);
  if (category) searchParams.set("category", category);
  if (sort && sort !== "featured") searchParams.set("sort", sort);
  if (targetPage > 1) searchParams.set("page", String(targetPage));
  const serialized = searchParams.toString();
  return serialized ? `/products?${serialized}` : "/products";
}

export default function Pagination({ page, totalPages, query = "", category = "", sort = "" }) {
  if (!totalPages || totalPages <= 1) return null;
  const href = (target) => buildProductsHref(target, { query, category, sort });

  return (
    <nav className="pagination" aria-label="পৃষ্ঠা নেভিগেশন">
      {page > 1 ? (
        <Link className="pagination__nav" href={href(page - 1)} rel="prev">
          <ChevronLeft aria-hidden="true" />
          আগে
        </Link>
      ) : (
        <span className="pagination__nav is-disabled" aria-disabled="true">
          <ChevronLeft aria-hidden="true" />
          আগে
        </span>
      )}
      <ul className="pagination__list">
        {buildPageWindow(page, totalPages).map((item, position) =>
          item === GAP ? (
            <li className="pagination__gap" key={`gap-${position}`} aria-hidden="true">…</li>
          ) : (
            <li key={item}>
              <Link className={`pagination__link${item === page ? " is-active" : ""}`} href={href(item)} aria-current={item === page ? "page" : undefined}>
                {item}
              </Link>
            </li>
          )
        )}
      </ul>
      {page < totalPages ? (
        <Link className="pagination__nav" href={href(page + 1)} rel="next">
          পরে
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span className="pagination__nav is-disabled" aria-disabled="true">
          পরে
          <ChevronRight aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
