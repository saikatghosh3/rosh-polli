"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LegalToc({ items = [], related = [] }) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");

  useEffect(() => {
    const headings = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!headings.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <aside className="legal-toc" aria-label="সূচিপত্র">
      <span className="legal-toc__title">সূচিপত্র</span>
      <nav>
        <ol>
          {items.map((item, index) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={activeId === item.id ? "is-active" : ""}>
                <span className="legal-toc__num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {related.length ? (
        <div className="legal-toc__related">
          <span className="legal-toc__title">আরও পড়ুন</span>
          {related.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
