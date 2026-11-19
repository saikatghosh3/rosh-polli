"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";

const purchaseMessages = [
  { title: "সাকিব · ২ মিনিট আগে", detail: "২ কেজি রস কিনেছেন।" },
  { title: "হাসান · ১ মিনিট আগে", detail: "৫ কেজি খেজুরের গুড় কিনেছেন।" },
  { title: "রাকিব · ৬ মিনিট আগে", detail: "২ কেজি আখের গুড় কিনেছেন।" },
  { title: "সুমন · ৩ মিনিট আগে", detail: "৪ কেজি তরল গুড় কিনেছেন।" },
  { title: "নাঈম · ৯ মিনিট আগে", detail: "১ কেজি ঝোলা গুড় কিনেছেন।" },
  { title: "ইমরান · ৪ মিনিট আগে", detail: "৩ কেজি পাটালি গুড় কিনেছেন।" },
  { title: "আরিফ · ৭ মিনিট আগে", detail: "২ কেজি খেজুরের গুড় কিনেছেন।" },
  { title: "মাহিন · ২ মিনিট আগে", detail: "৫ কেজি আখের গুড় কিনেছেন।" },
  { title: "সোহেল · ১০ মিনিট আগে", detail: "৩ কেজি ঝোলা গুড় কিনেছেন।" },
  { title: "জাহিদ · ১ মিনিট আগে", detail: "২ কেজি পাটালি গুড় কিনেছেন।" },
  { title: "তানভীর · ৫ মিনিট আগে", detail: "১ কেজি খাঁটি গুড় কিনেছেন।" },
  { title: "রুবেল · ৮ মিনিট আগে", detail: "৪ কেজি খেজুরের গুড় কিনেছেন।" },
  { title: "শাওন · ৩ মিনিট আগে", detail: "২ কেজি তরল গুড় কিনেছেন।" },
  { title: "ফাহিম · ৬ মিনিট আগে", detail: "৩ কেজি আখের গুড় কিনেছেন।" },
  { title: "সজীব · ৪ মিনিট আগে", detail: "১ কেজি পাটালি গুড় কিনেছেন।" },
  { title: "মেহেদী · ৯ মিনিট আগে", detail: "৫ কেজি ঝোলা গুড় কিনেছেন।" },
  { title: "রনি · ২ মিনিট আগে", detail: "৩ কেজি খাঁটি গুড় কিনেছেন।" },
  { title: "আশিক · ৭ মিনিট আগে", detail: "২ কেজি খেজুরের গুড় কিনেছেন।" },
  { title: "পারভেজ · ৫ মিনিট আগে", detail: "৩ কেজি ঝোলা গুড় কিনেছেন।" },
  { title: "জুবায়ের · ৪ মিনিট আগে", detail: "২ কেজি পাটালি গুড় কিনেছেন।" },
];

export function ShoppingActivity() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cycleTimer;
    let hideTimer;
    let firstMessage = true;

    function showNext() {
      setIndex((current) => {
        if (firstMessage) {
          firstMessage = false;
          return 0;
        }
        return (current + 1) % purchaseMessages.length;
      });
      setVisible(true);

      const interval = 3000 + Math.floor(Math.random() * 2001);
      hideTimer = window.setTimeout(() => setVisible(false), Math.floor(interval * 0.72));
      cycleTimer = window.setTimeout(showNext, interval);
    }

    cycleTimer = window.setTimeout(showNext, 900);
    return () => {
      window.clearTimeout(cycleTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const message = purchaseMessages[index];

  return (
    <aside className={`shopping-activity${visible ? " is-visible" : ""}`} role="status" aria-live="polite" aria-hidden={!visible}>
      <span className="shopping-activity__icon"><BadgeCheck aria-hidden="true" /></span>
      <div className="shopping-activity__copy">
        <strong key={`title-${index}`}>{message.title}</strong>
        <span key={`detail-${index}`}>{message.detail}</span>
      </div>
      <span className="shopping-activity__live" aria-hidden="true"><i /></span>
    </aside>
  );
}
