import demoStore from "@/data/demo-store.json";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Review from "@/models/Review";
import HeroSection from "@/models/HeroSection";
import Banner from "@/models/Banner";
import Testimonial from "@/models/Testimonial";
import SiteSettings from "@/models/SiteSettings";
import Order from "@/models/Order";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";

const defaultSettings = demoStore.siteSettings;

export function isDemoMode() {
  return !isDatabaseConfigured();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function plain(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

const DB_FALLBACK_MESSAGE = "ডেটাবেসে সংযোগ পাওয়া যাচ্ছে না — ডেমো পণ্য দেখানো হচ্ছে। অর্ডার ও রিভিউ সংরক্ষণ সাময়িকভাবে বন্ধ।";

async function withDatabase(factory, fallback) {
  if (!isDatabaseConfigured()) return fallback();
  try {
    await connectDatabase();
    return await factory();
  } catch {
    return fallback();
  }
}

export async function isStoreDemoMode() {
  if (!isDatabaseConfigured()) return true;
  try {
    await connectDatabase();
    return false;
  } catch {
    return true;
  }
}

export async function getRecentShoppingActivity() {
  return withDatabase(async () => {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const orders = await Order.find({ status: { $ne: "cancelled" }, createdAt: { $gte: since } })
      .sort({ createdAt: -1 }).limit(8).select("items.name items.quantity shippingAddress.district createdAt").lean();
    return orders.filter((order) => order.items?.length).map((order) => ({
      product: order.items[0].name,
      quantity: order.items[0].quantity,
      district: order.shippingAddress?.district || "বাংলাদেশ",
      createdAt: order.createdAt,
    }));
  }, () => []);
}

function mergeBrandStory(base, override) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    if (value !== "" && value !== null && value !== undefined) merged[key] = value;
  }
  return merged;
}

function normalizeProduct(document) {
  const product = document?.toObject ? document.toObject() : document;
  if (!product) return null;
  const category = product.category && typeof product.category === "object" ? product.category : null;
  return plain({
    ...product,
    id: String(product._id || product.id || product.slug),
    categorySlug: category?.slug || product.categorySlug || "",
    categoryName: category?.name || product.categoryName || "",
    images: product.images || [],
    sizes: product.sizes || [],
    ratingAverage: Number(product.ratingAverage || 0),
    ratingCount: Number(product.ratingCount || 0),
  });
}

function filterDemoProducts(filters = {}) {
  const query = String(filters.query || "").trim().toLocaleLowerCase("bn-BD");
  const category = String(filters.category || "");
  const minPrice = Number(filters.minPrice || 0);
  const maxPrice = Number(filters.maxPrice || Number.MAX_SAFE_INTEGER);
  const products = demoStore.products.filter((product) => {
    const searchable = `${product.name} ${product.tagline} ${product.description} ${product.categoryName}`.toLocaleLowerCase("bn-BD");
    return (!query || searchable.includes(query))
      && (!category || product.categorySlug === category)
      && product.price >= minPrice
      && product.price <= maxPrice;
  });
  if (filters.sort === "price-low") products.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price-high") products.sort((a, b) => b.price - a.price);
  else if (filters.sort === "newest") products.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival));
  else products.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  return products;
}

export async function getPublicRuntimeStatus() {
  if (!isDatabaseConfigured()) {
    return { mode: "demo", available: true, message: demoStore.announcement };
  }
  try {
    await connectDatabase();
    return { mode: "database", available: true, message: "" };
  } catch {
    return { mode: "unavailable", available: false, message: DB_FALLBACK_MESSAGE };
  }
}

export async function getSiteSettings() {
  if (!isDatabaseConfigured()) return defaultSettings;
  try {
    await connectDatabase();
    const settings = await SiteSettings.findOne({ key: "site" }).lean();
    if (!settings) return defaultSettings;
    return plain({
      ...defaultSettings,
      ...settings,
      socialLinks: { ...defaultSettings.socialLinks, ...(settings.socialLinks || {}) },
      brandStory: mergeBrandStory(demoStore.brandStory, settings.brandStory),
      socialGallery: settings.socialGallery || [],
    });
  } catch {
    return defaultSettings;
  }
}

export async function getAnnouncement() {
  if (!isDatabaseConfigured()) return demoStore.announcement;
  try {
    await connectDatabase();
    const settings = await SiteSettings.findOne({ key: "site" }).select("announcementText announcementActive").lean();
    if (settings?.announcementActive && settings.announcementText) return settings.announcementText;
    return "";
  } catch {
    return "";
  }
}

export const PRODUCT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 48;

const PRODUCT_SORTS = {
  "price-low": { price: 1, _id: 1 },
  "price-high": { price: -1, _id: 1 },
  newest: { createdAt: -1, _id: -1 },
  featured: { isFeatured: -1, createdAt: -1, _id: -1 },
};

function buildProductCriteria(filters = {}) {
  const query = String(filters.query || "").trim().slice(0, 80);
  const criteria = { isActive: true };
  if (filters.category) criteria.categorySlug = String(filters.category).slice(0, 100);
  if (query) {
    const regex = new RegExp(escapeRegex(query), "i");
    criteria.$or = [{ name: regex }, { tagline: regex }, { description: regex }, { categoryName: regex }];
  }
  if (filters.minPrice !== undefined && Number.isFinite(Number(filters.minPrice))) criteria.price = { ...(criteria.price || {}), $gte: Number(filters.minPrice) };
  if (filters.maxPrice !== undefined && Number.isFinite(Number(filters.maxPrice))) criteria.price = { ...(criteria.price || {}), $lte: Number(filters.maxPrice) };
  return criteria;
}

function buildProductSort(sort) {
  return PRODUCT_SORTS[sort] || PRODUCT_SORTS.featured;
}

function normalizePage(page, totalPages) {
  const requested = Number.parseInt(Array.isArray(page) ? page[0] : page, 10);
  const current = Number.isFinite(requested) && requested > 0 ? requested : 1;
  return Math.min(current, Math.max(1, totalPages));
}

function emptyPage(pageSize) {
  return { items: [], total: 0, page: 1, pageSize, totalPages: 1, hasPrev: false, hasNext: false };
}

export async function getProducts(filters = {}) {
  return withDatabase(async () => {
    const criteria = buildProductCriteria(filters);
    const products = await Product.find(criteria).populate("category", "name slug").sort(buildProductSort(filters.sort)).limit(100).lean();
    return products.map(normalizeProduct);
  }, () => filterDemoProducts(filters));
}

export async function getProductsPage(filters = {}) {
  const rawSize = Number(Array.isArray(filters.pageSize) ? filters.pageSize[0] : filters.pageSize);
  const pageSize = Number.isFinite(rawSize) && rawSize >= 1 ? Math.min(Math.floor(rawSize), MAX_PAGE_SIZE) : PRODUCT_PAGE_SIZE;

  const demoPage = () => {
    const all = filterDemoProducts(filters);
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    const page = normalizePage(filters.page, totalPages);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length, page, pageSize, totalPages, hasPrev: page > 1, hasNext: page < totalPages };
  };

  if (!isDatabaseConfigured()) return demoPage();

  try {
    await connectDatabase();
    const criteria = buildProductCriteria(filters);
    const total = await Product.countDocuments(criteria);
    if (!total) return emptyPage(pageSize);
    const totalPages = Math.ceil(total / pageSize);
    const page = normalizePage(filters.page, totalPages);
    const products = await Product.find(criteria)
      .populate("category", "name slug")
      .sort(buildProductSort(filters.sort))
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();
    return { items: products.map(normalizeProduct), total, page, pageSize, totalPages, hasPrev: page > 1, hasNext: page < totalPages };
  } catch {
    return demoPage();
  }
}

export async function getProductBySlug(slug) {
  const safeSlug = String(slug || "").slice(0, 160);
  const demoProduct = () => demoStore.products.find((product) => product.slug === safeSlug) || null;
  if (!isDatabaseConfigured()) return demoProduct();
  try {
    await connectDatabase();
    const product = await Product.findOne({ slug: safeSlug, isActive: true }).populate("category", "name slug").lean();
    return product ? normalizeProduct(product) : null;
  } catch {
    return demoProduct();
  }
}

export async function getProductsByCategory(categorySlug) {
  return getProducts({ category: categorySlug, sort: "featured" });
}

export async function getCategoryBySlug(slug) {
  const safeSlug = String(slug || "").slice(0, 100);
  const demoCategory = () => demoStore.categories.find((category) => category.slug === safeSlug) || null;
  if (!isDatabaseConfigured()) return demoCategory();
  try {
    await connectDatabase();
    const category = await Category.findOne({ slug: safeSlug, isActive: true }).lean();
    return category ? { ...category, id: String(category._id) } : null;
  } catch {
    return demoCategory();
  }
}

export async function getProductReviews(productId) {
  const demoReviews = () => (demoStore.reviews || []).filter((review) => String(review.productId) === String(productId));
  if (!isDatabaseConfigured()) return demoReviews();
  try {
    await connectDatabase();
    const reviews = await Review.find({ product: productId, status: "approved" }).select("name rating comment createdAt").sort({ createdAt: -1 }).limit(20).lean();
    return plain(reviews.map((review) => ({ ...review, id: String(review._id) })));
  } catch {
    return demoReviews();
  }
}

function tokenize(value) {
  return String(value || "")
    .toLocaleLowerCase("bn-BD")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 1);
}

function relevanceScore(product, source) {
  const sourceTokens = new Set(tokenize(`${source.name} ${source.tagline} ${source.description} ${source.categoryName}`));
  const productTokens = tokenize(`${product.name} ${product.tagline} ${product.description} ${product.categoryName}`);
  let score = 0;
  if (product.categorySlug && product.categorySlug === source.categorySlug) score += 6;
  for (const token of productTokens) if (sourceTokens.has(token)) score += 1;
  if (product.isFeatured) score += 2;
  if (product.isBestSeller) score += 1;
  if (product.isNewArrival) score += 1;
  return score;
}

function rankRelatedProducts(products, source, limit) {
  return products
    .filter((product) => product && product.slug !== source.slug && product.isActive !== false)
    .map((product, index) => ({ product, index, score: relevanceScore(product, source) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.product);
}

export async function getRelatedProducts(product, limit = 8) {
  if (!product) return [];
  const take = Math.max(1, Math.min(Number(limit) || 8, 24));

  if (!isDatabaseConfigured()) {
    return rankRelatedProducts(demoStore.products, product, take);
  }

  try {
    await connectDatabase();
    const ownId = product._id || product.id;
    const criteria = { isActive: true, _id: { $ne: ownId } };
    if (product.categorySlug) criteria.categorySlug = product.categorySlug;
    const sameCategory = await Product.find(criteria)
      .populate("category", "name slug")
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(take)
      .lean();

    let related = sameCategory.map(normalizeProduct);
    if (related.length < take) {
      const used = new Set(related.map((item) => String(item._id || item.id)));
      used.add(String(ownId));
      const filler = await Product.find({ isActive: true, _id: { $nin: [...used] } })
        .populate("category", "name slug")
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(take - related.length)
        .lean();
      related = related.concat(filler.map(normalizeProduct));
    }
    return rankRelatedProducts(related, product, take);
  } catch {
    return rankRelatedProducts(demoStore.products, product, take);
  }
}

export async function getHomePageData() {
  if (!isDatabaseConfigured()) {
    return {
      ...demoStore,
      settings: defaultSettings,
      featuredProducts: filterDemoProducts({}).filter((product) => product.isFeatured),
      newProducts: filterDemoProducts({ sort: "newest" }).filter((product) => product.isNewArrival),
      bestSellers: filterDemoProducts({}).filter((product) => product.isBestSeller),
      demoMode: true,
      databaseUnavailable: false,
    };
  }

  try {
    await connectDatabase();
    const [settingsDoc, heroDoc, categories, featured, newProducts, bestSellers, banners, testimonials] = await Promise.all([
      SiteSettings.findOne({ key: "site" }).lean(),
      HeroSection.findOne({ key: "home" }).lean(),
      Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
      Product.find({ isActive: true, isFeatured: true }).populate("category", "name slug").sort({ updatedAt: -1 }).limit(12).lean(),
      Product.find({ isActive: true, isNewArrival: true }).populate("category", "name slug").sort({ createdAt: -1 }).limit(12).lean(),
      Product.find({ isActive: true, isBestSeller: true }).populate("category", "name slug").sort({ updatedAt: -1 }).limit(12).lean(),
      Banner.find({ isActive: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: new Date() } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: new Date() } }] }] }).sort({ sortOrder: 1 }).limit(3).lean(),
      Testimonial.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(8).lean(),
    ]);
    const settings = settingsDoc ? {
      ...defaultSettings,
      ...settingsDoc,
      socialLinks: { ...defaultSettings.socialLinks, ...(settingsDoc.socialLinks || {}) },
      brandStory: mergeBrandStory(demoStore.brandStory, settingsDoc.brandStory),
      socialGallery: settingsDoc.socialGallery || [],
    } : defaultSettings;
    const hero = heroDoc ? { ...demoStore.hero, ...heroDoc } : demoStore.hero;
    return plain({
      settings,
      announcement: settings.announcementActive ? settings.announcementText : "",
      hero,
      categories: categories.map((category) => ({ ...category, id: String(category._id) })),
      products: featured.map(normalizeProduct),
      featuredProducts: featured.map(normalizeProduct),
      newProducts: newProducts.map(normalizeProduct),
      bestSellers: bestSellers.map(normalizeProduct),
      brandStory: settings.brandStory || demoStore.brandStory,
      promotion: banners[0] || null,
      banners: banners.map((banner) => ({ ...banner, id: String(banner._id) })),
      testimonials: testimonials.map((testimonial) => ({ ...testimonial, id: String(testimonial._id) })),
      socialGallery: settings.socialGallery || [],
      demoMode: false,
      databaseUnavailable: false,
    });
  } catch {
    return {
      ...demoStore,
      settings: defaultSettings,
      announcement: DB_FALLBACK_MESSAGE,
      featuredProducts: filterDemoProducts({}).filter((product) => product.isFeatured),
      newProducts: filterDemoProducts({ sort: "newest" }).filter((product) => product.isNewArrival),
      bestSellers: filterDemoProducts({}).filter((product) => product.isBestSeller),
      demoMode: true,
      databaseUnavailable: true,
    };
  }
}
