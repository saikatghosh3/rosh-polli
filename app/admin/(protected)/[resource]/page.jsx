import { notFound } from "next/navigation";
import AdminProductsClient from "@/components/admin/admin-products-client";
import AdminResourceClient from "@/components/admin/admin-resource-client";
import { getAdminResource } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
const resources = new Set(["products", "categories", "orders", "customers", "reviews", "coupons", "hero", "banners", "testimonials", "newsletter", "settings"]);

export default async function AdminResourcePage({ params, searchParams }) {
  const [{ resource }, query] = await Promise.all([params, searchParams]);
  if (!resources.has(resource)) notFound();
  const search = typeof query?.q === "string" ? query.q : "";
  const [result, relatedOrders] = await Promise.all([
    getAdminResource(resource, { page: query?.page, search }),
    resource === "reviews" ? getAdminResource("orders", { page: 1, pageSize: 100 }) : Promise.resolve({ items: [] }),
  ]);
  if (resource === "products") return <AdminProductsClient result={result} search={search} />;
  const reviewOrderOptions = relatedOrders.items.filter((order) => order.status === "delivered").flatMap((order) => (order.items || [])
    .filter((item) => item.product)
    .map((item) => ({
      value: `${order._id}::${item.product}`,
      label: `${order.orderNumber} · ${item.name} · ${order.customer?.name || "গ্রাহক"}`,
    })));
  return <AdminResourceClient resource={resource} result={result} relatedOptions={reviewOrderOptions} />;
}
