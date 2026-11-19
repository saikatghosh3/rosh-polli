"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/product-card";

export default function ProductRail({ products = [], label = "পণ্য স্লাইডার", emptyMessage = "এই সংগ্রহে নতুন পণ্য শিগগিরই যোগ হবে।", hideProgress = false, className = "" }) {
  const railRef = useRef(null);
  const dragState = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [edge, setEdge] = useState({ atStart: true, atEnd: true });
  const [thumb, setThumb] = useState({ width: 100, left: 0 });
  const [dragging, setDragging] = useState(false);

  const measure = useCallback(() => {
    const node = railRef.current;
    if (!node) return;
    const scrollable = node.scrollWidth - node.clientWidth;
    const ratio = scrollable > 4 ? node.scrollLeft / scrollable : 0;
    const width = node.scrollWidth > 0 ? Math.min(1, node.clientWidth / node.scrollWidth) : 1;
    const nextThumb = { width: width * 100, left: Math.min(1, Math.max(0, ratio)) * (100 - width * 100) };
    const nextEdge = {
      atStart: node.scrollLeft <= 4,
      atEnd: node.scrollLeft + node.clientWidth >= node.scrollWidth - 4,
    };
    setThumb((prev) => (Math.abs(prev.width - nextThumb.width) < 0.1 && Math.abs(prev.left - nextThumb.left) < 0.1 ? prev : nextThumb));
    setEdge((prev) => (prev.atStart === nextEdge.atStart && prev.atEnd === nextEdge.atEnd ? prev : nextEdge));
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    const timers = [setTimeout(schedule, 300), setTimeout(schedule, 1200)];
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (observer) observer.observe(el);

    const handleLoad = (event) => {
      if (event.target && event.target.tagName === "IMG") schedule();
    };

    el.addEventListener("scroll", schedule, { passive: true });
    el.addEventListener("load", handleLoad, true);
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((timer) => clearTimeout(timer));
      if (observer) observer.disconnect();
      el.removeEventListener("scroll", schedule);
      el.removeEventListener("load", handleLoad, true);
      window.removeEventListener("resize", schedule);
    };
  }, [products, measure]);

  useEffect(() => {
    if (!dragging) return undefined;

    function handlePointerMove(event) {
      const state = dragState.current;
      const node = railRef.current;
      if (!state.active || !node) return;
      const delta = event.clientX - state.startX;
      if (Math.abs(delta) > 4) state.moved = true;
      if (state.moved) {
        event.preventDefault();
        node.scrollLeft = state.startScroll - delta;
      }
    }

    function handlePointerUp() {
      dragState.current.active = false;
      setDragging(false);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragging]);

  function scrollStep() {
    const node = railRef.current;
    if (!node) return 300;
    const item = node.querySelector(".product-rail__item");
    if (!item) return Math.max(280, node.clientWidth * 0.72);
    const styles = window.getComputedStyle(node);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 18;
    return item.getBoundingClientRect().width + gap;
  }

  function scroll(direction) {
    const node = railRef.current;
    if (!node) return;
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
    const nextLeft = Math.min(maxScroll, Math.max(0, node.scrollLeft + direction * scrollStep()));
    node.scrollTo({ left: nextLeft, behavior: "smooth" });
    window.setTimeout(measure, 350);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scroll(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scroll(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      railRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } else if (event.key === "End") {
      event.preventDefault();
      const node = railRef.current;
      if (node) node.scrollTo({ left: node.scrollWidth, behavior: "smooth" });
    }
  }

  function isInteractive(target) {
    return Boolean(target && target.closest && target.closest("button, a, input, select, textarea, label"));
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || event.pointerType !== "mouse" || isInteractive(event.target)) return;
    const node = railRef.current;
    if (!node) return;
    dragState.current = { active: true, startX: event.clientX, startScroll: node.scrollLeft, moved: false };
    setDragging(true);
  }

  function handleClickCapture(event) {
    if (dragState.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragState.current.moved = false;
    }
  }

  if (!products.length) return <p className="quiet-empty">{emptyMessage}</p>;

  const showThumb = !(edge.atStart && edge.atEnd);

  return (
    <div className={`product-rail-wrap${dragging ? " is-dragging" : ""}${className ? ` ${className}` : ""}`}>
      <div
        className="product-rail"
        ref={railRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {products.map((product, index) => (
          <div className="product-rail__item" key={product._id || product.id || product.slug}>
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>

      <div className="product-rail-controls">
        <button type="button" className="icon-button rail-arrow" onClick={() => scroll(-1)} disabled={edge.atStart} aria-label="আগের পণ্য দেখুন"><ArrowLeft aria-hidden="true" /></button>
        <button type="button" className="icon-button rail-arrow" onClick={() => scroll(1)} disabled={edge.atEnd} aria-label="পরের পণ্য দেখুন"><ArrowRight aria-hidden="true" /></button>
      </div>

      {!hideProgress && showThumb ? (
        <div className="product-rail__progress" aria-hidden="true">
          <span className="product-rail__thumb" style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }} />
        </div>
      ) : null}
    </div>
  );
}
