"use client";

import { ErrorState } from "@/components/states";

export default function ProductsError({ error, reset }) {
  return (
    <ErrorState
      title="পণ্য তালিকা লোড করা যায়নি"
      description={error?.message || "কোনো কারণে পণ্য তালিকা লোড করা যায়নি।"}
      fixes={[
        "ইন্টারনেট সংযোগ পরীক্ষা করুন।",
        "পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।",
        "সমস্যা থাকলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।"
      ]}
      onRetry={reset}
      primaryAction={{ href: "/products", children: "পুনরায় চেষ্টা করুন" }}
      secondaryAction={{ href: "/", children: "হোমে ফিরে যান" }}
    />
  );
}
