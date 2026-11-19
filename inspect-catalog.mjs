import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

const demoStore = JSON.parse(await readFile("data/demo-store.json", "utf8"));
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 12000, maxPoolSize: 2 });
  const [products, categories] = await Promise.all([
    Product.find({}).select("slug isActive").lean(),
    Category.find({}).select("slug isActive").lean(),
  ]);
  console.log(JSON.stringify({
    sourceProducts: demoStore.products.map(({ slug, categorySlug }) => ({ slug, categorySlug })),
    sourceCategories: demoStore.categories.map(({ slug }) => slug),
    existingProducts: products.map(({ slug, isActive }) => ({ slug, isActive })),
    existingCategories: categories.map(({ slug, isActive }) => ({ slug, isActive })),
  }));
} finally {
  await mongoose.disconnect().catch(() => {});
}
