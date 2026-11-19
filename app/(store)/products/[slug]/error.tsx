"use client";

import { NotFoundState } from "@/components/states";

export default function ProductDetailError({ error, reset }) {
  return (
    <NotFoundState entity="পণ্য" onRetry={reset} />
  );
}
