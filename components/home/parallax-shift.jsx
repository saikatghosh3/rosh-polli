"use client";

import { useEffect, useRef } from "react";

export default function ParallaxShift({ children, className = "", distance = 36 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      el.style.transform = "translate3d(0, 0, 0) scale(1)";
      return undefined;
    }

    let raf = 0;

    function update() {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const progress = (viewH - rect.top) / (viewH + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const y = ((clamped - 0.5) * 2 * distance) / 2.35;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(1.06)`;
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
