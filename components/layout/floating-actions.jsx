"use client";

import { useEffect, useState } from "react";
import { ChevronUp, MessageCircle } from "lucide-react";

function toWaNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  if (digits.startsWith("88")) return digits;
  return `88${digits}`;
}

export default function FloatingActions({ whatsapp = "" }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 480);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waNumber = toWaNumber(whatsapp);

  return (
    <div className="floating-actions" aria-label="দ্রুত অ্যাকশন">
      {showTop ? (
        <button
          type="button"
          className="floating-action floating-action--top"
          aria-label="পেজের শুরুতে ফিরে যান"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp aria-hidden="true" />
        </button>
      ) : null}
      {waNumber ? (
        <a
          className="floating-action floating-action--whatsapp"
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noreferrer"
          aria-label="হোয়াটসঅ্যাপে কথা বলুন"
        >
          <MessageCircle aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}
