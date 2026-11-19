import Link from "next/link";

const GAP = "gap";
const bn = (value) => new Intl.NumberFormat("bn-BD").format(value);

export function buildPageWindow(current, totalPages) {
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

export default function AdminPagination({ page, pageCount, hrefFor, label }) {
  if (pageCount <= 1) return null;
  const current = Math.min(Math.max(1, page), pageCount);

  return (
    <nav className="admin-pagination" aria-label={label}>
      <div className="admin-pagination__group">
        <Link aria-disabled={current <= 1} href={hrefFor(Math.max(1, current - 1))}>আগের পৃষ্ঠা</Link>
        {buildPageWindow(current, pageCount).map((item, position) =>
          item === GAP ? (
            <span className="admin-pagination__gap" key={`gap-${position}`} aria-hidden="true">…</span>
          ) : (
            <Link key={item} className={item === current ? "is-active" : ""} aria-current={item === current ? "page" : undefined} href={hrefFor(item)}>
              {bn(item)}
            </Link>
          )
        )}
        <Link aria-disabled={current >= pageCount} href={hrefFor(Math.min(pageCount, current + 1))}>পরের পৃষ্ঠা</Link>
      </div>
      <span>পৃষ্ঠা {bn(current)} / {bn(pageCount)}</span>
    </nav>
  );
}
