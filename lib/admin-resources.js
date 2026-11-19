import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Review from "@/models/Review";
import Coupon from "@/models/Coupon";
import Banner from "@/models/Banner";
import HeroSection from "@/models/HeroSection";
import Testimonial from "@/models/Testimonial";
import Newsletter from "@/models/Newsletter";
import SiteSettings from "@/models/SiteSettings";

export const adminResourceModels = {
  products: Product,
  categories: Category,
  orders: Order,
  reviews: Review,
  coupons: Coupon,
  hero: HeroSection,
  banners: Banner,
  testimonials: Testimonial,
  newsletter: Newsletter,
  settings: SiteSettings,
};

export const adminResourceLabels = {
  products: "পণ্য",
  categories: "সংগ্রহ",
  orders: "অর্ডার",
  customers: "ক্রেতা",
  reviews: "রিভিউ",
  coupons: "কুপন",
  hero: "হিরো কনটেন্ট",
  banners: "প্রমোশনাল ব্যানার",
  testimonials: "প্রশংসাপত্র",
  newsletter: "নিউজলেটার",
  settings: "সেটিংস",
};

export const orderStatuses = [
  { value: "new", label: "নতুন অর্ডার" },
  { value: "confirmed", label: "নিশ্চিত করা হয়েছে" },
  { value: "processing", label: "প্রসেসিং" },
  { value: "shipped", label: "শিপড" },
  { value: "delivered", label: "ডেলিভারড" },
  { value: "cancelled", label: "বাতিল" },
];

export const reviewStatuses = [
  { value: "pending", label: "পর্যালোচনাধীন" },
  { value: "approved", label: "অনুমোদিত" },
  { value: "rejected", label: "প্রত্যাখ্যাত" },
];
