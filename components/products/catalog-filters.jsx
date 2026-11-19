"use client";

import Link from "next/link";
import { useState } from "react";
import StoreSelect from "@/components/ui/store-select";

export default function CatalogFilters({ categories = [], query = "", category = "", sort = "featured" }) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedSort, setSelectedSort] = useState(sort);

  return (
    <form className="catalog-filters" action="/products">
      {query ? <input type="hidden" name="q" value={query} /> : null}
      <label className="field-label">সংগ্রহ
        <StoreSelect name="category" value={selectedCategory} onChange={setSelectedCategory} placeholder="সব সংগ্রহ" ariaLabel="সংগ্রহ" options={categories.map((item) => ({ value: item.slug, label: item.name }))} />
      </label>
      <label className="field-label">সাজান
        <StoreSelect name="sort" value={selectedSort} onChange={setSelectedSort} ariaLabel="সাজান" options={[
          { value: "featured", label: "নির্বাচিত" },
          { value: "newest", label: "নতুন আগে" },
          { value: "price-low", label: "দাম: কম থেকে বেশি" },
          { value: "price-high", label: "দাম: বেশি থেকে কম" },
        ]} />
      </label>
      <button className="button button--outline catalog-filters__submit" type="submit">ফলাফল দেখুন</button>
      {query ? <Link className="text-link catalog-filters__clear" href="/products">সার্চ মুছুন</Link> : null}
    </form>
  );
}
