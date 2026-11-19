import { getHomePageData, getProducts } from "@/lib/storefront-data";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap() {
  const baseUrl = getSiteUrl();
  const [products, home] = await Promise.all([getProducts(), getHomePageData()]);
  const staticRoutes = ["", "/products", "/collections", "/about", "/contact"];
  const collectionRoutes = home.categories.map((category) => `/collections/${category.slug}`);
  const productRoutes = products.map((product) => `/products/${product.slug}`);
  return [...new Set([...staticRoutes, ...collectionRoutes, ...productRoutes])].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/products/") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/products/") ? 0.7 : 0.8,
  }));
}
