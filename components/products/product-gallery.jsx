"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

const FALLBACK_IMAGE = "/images/collection-misti.svg";

export default function ProductGallery({ product }) {
  const images = product.images?.length ? product.images : [FALLBACK_IMAGE];
  const total = images.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const mainRef = useRef(null);
  const closeButtonRef = useRef(null);
  const hadLightboxRef = useRef(false);
  const canZoomRef = useRef(false);
  const touchStartXRef = useRef(null);

  const goNext = useCallback(() => setActiveIndex((current) => (current + 1) % total), [total]);
  const goPrev = useCallback(() => setActiveIndex((current) => (current - 1 + total) % total), [total]);

  useEffect(() => {
    canZoomRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsLightboxOpen(false);
      else if (event.key === "ArrowRight") goNext();
      else if (event.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen, goNext, goPrev]);

  useEffect(() => {
    if (isLightboxOpen) {
      hadLightboxRef.current = true;
      closeButtonRef.current?.focus();
    } else if (hadLightboxRef.current) {
      hadLightboxRef.current = false;
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [isLightboxOpen]);

  function openLightbox() {
    setZoom((current) => ({ ...current, active: false }));
    setIsLightboxOpen(true);
  }

  function handleZoomMove(event) {
    if (!canZoomRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  function handleZoomEnd() {
    setZoom((current) => ({ ...current, active: false }));
  }

  function handleTouchStart(event) {
    touchStartXRef.current = event.changedTouches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartXRef.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  const currentImage = images[activeIndex];
  const currentAlt = `${product.name} পণ্যের ছবি ${activeIndex + 1}`;

  return (
    <div className="product-gallery">
      <div className="product-gallery__stage">
        <div
          ref={mainRef}
          className={`product-gallery__main${zoom.active ? " is-zooming" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="ছবি জুম করে বড় করে দেখুন"
          onClick={openLightbox}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openLightbox();
            }
          }}
          onMouseMove={handleZoomMove}
          onMouseLeave={handleZoomEnd}
        >
          <Image
            key={activeIndex}
            src={currentImage}
            alt={currentAlt}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 800px) 100vw, 54vw"
            className="product-gallery__image"
            style={{
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
              transform: zoom.active ? "scale(2.4)" : "scale(1)",
            }}
          />
          <span className="product-gallery__counter" aria-hidden="true">{activeIndex + 1} / {total}</span>
          <span className="product-gallery__zoom-hint" aria-hidden="true"><ZoomIn aria-hidden="true" />জুম করে দেখুন</span>
        </div>
        {total > 1 ? (
          <>
            <button className="product-gallery__arrow product-gallery__arrow--prev" type="button" onClick={goPrev} aria-label="আগের ছবি"><ChevronLeft aria-hidden="true" /></button>
            <button className="product-gallery__arrow product-gallery__arrow--next" type="button" onClick={goNext} aria-label="পরের ছবি"><ChevronRight aria-hidden="true" /></button>
          </>
        ) : null}
      </div>
      {total > 1 ? (
        <div className="product-gallery__thumbs" aria-label="পণ্যের অন্যান্য ছবি">
          {images.map((image, index) => (
            <button
              className={`product-gallery__thumb${index === activeIndex ? " is-active" : ""}`}
              type="button"
              key={`${image}-${index}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`ছবি ${index + 1} দেখুন`}
              aria-pressed={index === activeIndex}
            >
              <Image src={image} alt="" fill sizes="84px" />
            </button>
          ))}
        </div>
      ) : null}
      {isLightboxOpen ? (
        <div
          className="product-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} — ছবির গ্যালারি`}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setIsLightboxOpen(false); }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button ref={closeButtonRef} className="product-gallery__lightbox-close" type="button" onClick={() => setIsLightboxOpen(false)} aria-label="গ্যালারি বন্ধ করুন"><X aria-hidden="true" /></button>
          <figure className="product-gallery__lightbox-frame">
            <Image
              key={`lightbox-${activeIndex}`}
              src={currentImage}
              alt={currentAlt}
              fill
              sizes="(max-width: 900px) 92vw, 1020px"
              className="product-gallery__lightbox-image"
            />
            {total > 1 ? (
              <>
                <button className="product-gallery__lightbox-arrow product-gallery__lightbox-arrow--prev" type="button" onClick={goPrev} aria-label="আগের ছবি"><ChevronLeft aria-hidden="true" /></button>
                <button className="product-gallery__lightbox-arrow product-gallery__lightbox-arrow--next" type="button" onClick={goNext} aria-label="পরের ছবি"><ChevronRight aria-hidden="true" /></button>
              </>
            ) : null}
          </figure>
          <div className="product-gallery__lightbox-bar">
            <div className="product-gallery__lightbox-thumbs">
              {images.map((image, index) => (
                <button
                  className={`product-gallery__lightbox-thumb${index === activeIndex ? " is-active" : ""}`}
                  type="button"
                  key={`lb-${image}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`ছবি ${index + 1}`}
                  aria-pressed={index === activeIndex}
                >
                  <Image src={image} alt="" fill sizes="56px" />
                </button>
              ))}
            </div>
            <span className="product-gallery__lightbox-counter">{String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
