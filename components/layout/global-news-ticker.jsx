"use client";

import { usePathname } from "next/navigation";
import NewsTicker from "@/components/home/news-ticker";

export default function GlobalNewsTicker() {
  const pathname = usePathname();
  return pathname === "/" ? null : <NewsTicker />;
}
