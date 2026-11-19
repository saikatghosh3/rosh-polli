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
import { adminResourceModels } from "@/lib/admin-resources";
import { connectDatabase } from "@/lib/db";
import demoStore from "@/data/demo-store.json";

const pageSize = 8;

function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSearchFilter(resource, search) {
  const value = String(search || "").trim().slice(0, 80);
  if (!value) return {};
  const safe = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safe, "i");
  if (resource === "products") return { $or: [{ name: regex }, { slug: regex }, { categoryName: regex }] };
  if (resource === "categories") return { $or: [{ name: regex }, { slug: regex }] };
  if (resource === "orders") return { $or: [{ orderNumber: regex }, { "customer.name": regex }, { "customer.phone": regex }] };
  if (resource === "reviews") return { $or: [{ name: regex }, { email: regex }, { comment: regex }] };
  if (resource === "coupons") return { code: regex };
  if (resource === "newsletter") return { email: regex };
  if (resource === "testimonials") return { $or: [{ name: regex }, { quote: regex }] };
  if (resource === "banners") return { title: regex };
  return {};
}

export async function getAdminResource(resource, { page = 1, search = "", pageSize: requestedPageSize = pageSize } = {}) {
  await connectDatabase();
  const currentPage = Math.max(1, Math.min(10000, Number(page) || 1));
  const perPage = Math.max(1, Math.min(100, Number(requestedPageSize) || pageSize));
  const skip = (currentPage - 1) * perPage;
  const filter = buildSearchFilter(resource, search);

  if (resource === "customers") {
    const value = String(search || "").trim().slice(0, 80);
    const safe = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = value ? new RegExp(safe, "i") : null;
    const match = regex ? { $or: [{ "customer.name": regex }, { "customer.phone": regex }, { "customer.email": regex }] } : {};
    const [items, total] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$customer.phone", name: { $first: "$customer.name" }, phone: { $first: "$customer.phone" }, email: { $first: "$customer.email" }, orderCount: { $sum: 1 }, totalSpent: { $sum: "$total" }, lastOrderAt: { $first: "$createdAt" } } },
        { $sort: { lastOrderAt: -1 } },
        { $skip: skip },
        { $limit: perPage },
      ]),
      Order.distinct("customer.phone", match).then((rows) => rows.length),
    ]);
    return { items: serialize(items), total, page: currentPage, pageSize: perPage };
  }

  if (resource === "hero") {
    const hero = await HeroSection.findOne({ key: "home" }).lean();
    return { items: hero ? [serialize(hero)] : [{ ...demoStore.hero, _id: "home", key: "home" }], total: hero ? 1 : 0, page: 1, pageSize: perPage };
  }

  if (resource === "settings") {
    const settings = await SiteSettings.findOne({ key: "site" }).lean();
    const fallbackSettings = { ...demoStore.siteSettings, brandStory: demoStore.brandStory, socialGallery: demoStore.socialGallery || [] };
    const current = settings ? { ...fallbackSettings, ...settings, brandStory: { ...demoStore.brandStory, ...(settings.brandStory || {}) }, socialGallery: settings.socialGallery || [] } : fallbackSettings;
    return { items: [serialize(current)], total: settings ? 1 : 0, page: 1, pageSize: perPage };
  }

  const Model = adminResourceModels[resource];
  if (!Model) throw Object.assign(new Error("এই অ্যাডমিন বিভাগটি পাওয়া যায়নি।"), { code: "RESOURCE_NOT_FOUND" });
  const sort = resource === "orders" ? { createdAt: -1 } : resource === "newsletter" ? { createdAt: -1 } : { updatedAt: -1, sortOrder: 1 };
  let query = Model.find(filter).sort(sort).skip(skip).limit(perPage);
  if (resource === "products") query = query.populate("category", "name slug");
  if (resource === "reviews") query = query.populate("product", "name slug").populate("order", "orderNumber customer.name");
  const [items, total] = await Promise.all([query.lean(), Model.countDocuments(filter)]);
  return { items: serialize(items), total, page: currentPage, pageSize: perPage };
}

export async function getAdminRecord(resource, id) {
  await connectDatabase();
  if (resource === "settings") {
    const settings = await SiteSettings.findOne({ key: "site" }).lean();
    const defaults = { ...demoStore.siteSettings, brandStory: demoStore.brandStory, socialGallery: demoStore.socialGallery || [] };
    return serialize(settings ? { ...defaults, ...settings, brandStory: { ...demoStore.brandStory, ...(settings.brandStory || {}) }, socialGallery: settings.socialGallery || [] } : defaults);
  }
  if (resource === "hero") return serialize(await HeroSection.findOne({ key: id === "home" ? "home" : id }).lean());
  const Model = adminResourceModels[resource];
  if (!Model) throw Object.assign(new Error("এই অ্যাডমিন বিভাগটি পাওয়া যায়নি।"), { code: "RESOURCE_NOT_FOUND" });
  let query = Model.findById(id);
  if (resource === "products") query = query.populate("category", "name slug");
  if (resource === "reviews") query = query.populate("product", "name slug");
  const record = await query.lean();
  return record ? serialize(record) : null;
}

export async function getAdminDashboardData() {
  await connectDatabase();
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCMonth(start.getUTCMonth() - 5);

  const [activeProducts, orderCount, customerCount, revenueAggregate, recentOrders, monthlyRows, bestRows, statusRows] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.distinct("customer.phone").then((rows) => rows.length),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6).select("orderNumber customer status total createdAt").lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: start }, status: { $ne: "cancelled" } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, units: { $sum: "$items.quantity" }, revenue: { $sum: "$items.lineTotal" } } },
      { $sort: { units: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);

  const monthMap = new Map(monthlyRows.map((row) => [row._id, row]));
  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(start);
    date.setUTCMonth(start.getUTCMonth() + index);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const row = monthMap.get(key);
    return {
      label: new Intl.DateTimeFormat("bn-BD", { month: "short" }).format(date),
      revenue: Number(row?.revenue || 0),
      orders: Number(row?.orders || 0),
    };
  });

  return {
    stats: {
      revenue: Number(revenueAggregate[0]?.revenue || 0),
      orders: orderCount,
      products: activeProducts,
      customers: customerCount,
    },
    recentOrders: serialize(recentOrders),
    monthlyRevenue,
    bestSellers: bestRows.map((row) => ({ id: String(row._id), name: row.name, quantity: Number(row.units), revenue: Number(row.revenue) })),
    statusCounts: statusRows.map((row) => ({ status: row._id, count: Number(row.count) })),
  };
}
