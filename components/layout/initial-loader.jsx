"use client";

import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 700;
const MAX_VISIBLE_MS = 3000;

const LOADER_CSS = `
.initial-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background:
    radial-gradient(120% 80% at 50% -10%, #ffffff 0%, rgba(250, 248, 243, 0) 62%),
    radial-gradient(100% 70% at 50% 115%, rgba(139, 57, 70, 0.16) 0%, rgba(139, 57, 70, 0) 55%),
    #faf8f3;
  opacity: 1;
  visibility: visible;
  transition: opacity 520ms ease, visibility 520ms ease;
  animation: initial-loader-failsafe 1ms linear 4.5s forwards;
}
.initial-loader.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.initial-loader__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: initial-loader-rise 640ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.initial-loader__brand {
  font-family: 'Noto Serif Bengali', 'Noto Serif', Georgia, serif;
  font-size: clamp(46px, 8vw, 68px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.06em;
  color: #080908;
}
.initial-loader__caption {
  margin-top: 6px;
  color: #6e6f68;
  font-family: 'Noto Sans Bengali', 'Nirmala UI', 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.24em;
}
.initial-loader__rule {
  position: relative;
  display: block;
  width: 148px;
  height: 2px;
  margin-top: 22px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(8, 9, 8, 0.09);
}
.initial-loader__rule::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 44%;
  border-radius: 99px;
  background: linear-gradient(90deg, rgba(139, 57, 70, 0), #8b3946, rgba(139, 57, 70, 0));
  content: "";
  animation: initial-loader-slide 1.15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes initial-loader-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes initial-loader-slide {
  from { transform: translateX(-130%); }
  to { transform: translateX(360%); }
}
@keyframes initial-loader-failsafe {
  to { opacity: 0; visibility: hidden; pointer-events: none; }
}
@media (prefers-reduced-motion: reduce) {
  .initial-loader { transition-duration: 1ms; }
  .initial-loader__inner { animation: none; }
  .initial-loader__rule::after { width: 100%; animation: none; background: #8b3946; opacity: 0.85; }
}
`;

export default function InitialLoader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let settled = false;
    let minTimer = null;
    const startedAt = performance.timeOrigin || Date.now();

    const hide = () => {
      if (settled) return;
      settled = true;
      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
      minTimer = setTimeout(() => setHidden(true), remaining);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    const failsafe = setTimeout(hide, Math.max(0, MAX_VISIBLE_MS - (Date.now() - startedAt)));

    return () => {
      window.removeEventListener("load", hide);
      if (minTimer) clearTimeout(minTimer);
      clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      className={`initial-loader${hidden ? " is-hidden" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="পাতা লোড হচ্ছে"
      aria-busy={!hidden}
      {...(hidden ? { "aria-hidden": "true" } : {})}
    >
      <style>{LOADER_CSS}</style>
      <div className="initial-loader__inner">
        <span className="initial-loader__brand">রসপল্লী</span>
        <span className="initial-loader__caption">কেজুর গুর ও রস</span>
        <span className="initial-loader__rule" aria-hidden="true" />
      </div>
    </div>
  );
}
