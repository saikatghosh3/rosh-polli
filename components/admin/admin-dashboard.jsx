import Link from "next/link";
import { Boxes, ClipboardList, UsersRound, WalletCards } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import RevenueChart from "@/components/admin/revenue-chart";

const statusLabels = { new: "নতুন", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াধীন", shipped: "পাঠানো হয়েছে", delivered: "সম্পন্ন", cancelled: "বাতিল" };

function MetricCard({ icon: Icon, label, value, note, href }) {
  return (
    <Link className="admin-metric-card" href={href}>
      <span className="admin-metric-card__icon"><Icon aria-hidden="true" /></span>
      <span className="admin-metric-card__label">{label}</span>
      <strong className="admin-metric-card__value">{value}</strong>
      <span className="admin-metric-card__note">{note}</span>
    </Link>
  );
}

export default function AdminDashboard({ data }) {
  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div><span className="eyebrow">আজকের সারসংক্ষেপ</span><h1>স্বাগতম, {data.adminName}</h1><p>আপনার স্টোরের সাম্প্রতিক কার্যক্রম এক নজরে দেখুন।</p></div>
        <Link className="button button--dark" href="/admin/products/create">নতুন পণ্য যোগ করুন</Link>
      </div>
      <section className="admin-metrics" aria-label="স্টোরের মূল পরিসংখ্যান">
        <MetricCard icon={WalletCards} label="মোট বিক্রি" value={formatPrice(data.stats.revenue)} note="বাতিল অর্ডার বাদে" href="/admin/orders" />
        <MetricCard icon={ClipboardList} label="মোট অর্ডার" value={new Intl.NumberFormat("bn-BD").format(data.stats.orders)} note="সব অর্ডার" href="/admin/orders" />
        <MetricCard icon={Boxes} label="সক্রিয় পণ্য" value={new Intl.NumberFormat("bn-BD").format(data.stats.products)} note="ক্যাটালগে প্রকাশিত" href="/admin/products" />
        <MetricCard icon={UsersRound} label="গ্রাহক" value={new Intl.NumberFormat("bn-BD").format(data.stats.customers)} note="অর্ডার করা অনন্য গ্রাহক" href="/admin/customers" />
      </section>
      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-revenue-panel">
          <div className="admin-panel__header"><div><h2>বিক্রির প্রবণতা</h2><p>গত ছয় মাসের অর্ডার-ভিত্তিক বিক্রি</p></div><span className="admin-panel__period">৬ মাস</span></div>
          <RevenueChart data={data.monthlyRevenue} />
        </article>
        <article className="admin-panel admin-recent-panel">
          <div className="admin-panel__header"><div><h2>সাম্প্রতিক অর্ডার</h2><p>সর্বশেষ গ্রাহক অর্ডার</p></div><Link href="/admin/orders">সব দেখুন</Link></div>
          {data.recentOrders.length ? <div className="admin-compact-list">{data.recentOrders.map((order) => <Link className="admin-compact-row" href={`/admin/orders`} key={order._id}><span className="admin-compact-row__initial">{order.customer?.name?.slice(0, 1) || "অ"}</span><span className="admin-compact-row__copy"><strong>{order.customer?.name || "গ্রাহক"}</strong><small>{order.orderNumber} · {formatDate(order.createdAt)}</small></span><span className="admin-compact-row__amount"><strong>{formatPrice(order.total)}</strong><small className={`status-pill status-pill--${order.status}`}>{statusLabels[order.status] || order.status}</small></span></Link>)}</div> : <div className="admin-empty-state"><span>এখনও কোনো অর্ডার নেই</span><p>নতুন অর্ডার এলে এখানে দেখা যাবে।</p></div>}
        </article>
        <article className="admin-panel admin-best-panel">
          <div className="admin-panel__header"><div><h2>জনপ্রিয় পণ্য</h2><p>পরিমাণ অনুযায়ী শীর্ষ বিক্রি</p></div><Link href="/admin/products">পণ্য দেখুন</Link></div>
          {data.bestSellers.length ? <div className="admin-best-list">{data.bestSellers.map((product, index) => <div className="admin-best-row" key={product.id}><span className="admin-best-row__rank">{new Intl.NumberFormat("bn-BD").format(index + 1)}</span><span><strong>{product.name}</strong><small>{new Intl.NumberFormat("bn-BD").format(product.quantity)}টি বিক্রি</small></span><strong>{formatPrice(product.revenue)}</strong></div>)}</div> : <div className="admin-empty-state"><span>বিক্রির তথ্য নেই</span><p>অর্ডার সম্পন্ন হলে জনপ্রিয় পণ্য দেখানো হবে।</p></div>}
        </article>
        <article className="admin-panel admin-order-summary">
          <div className="admin-panel__header"><div><h2>অর্ডারের অবস্থা</h2><p>বর্তমান অর্ডার বণ্টন</p></div></div>
          <div className="admin-status-list">{data.statusCounts.map((item) => <div className="admin-status-row" key={item.status}><span><i className={`status-dot status-dot--${item.status}`} />{statusLabels[item.status] || item.status}</span><strong>{new Intl.NumberFormat("bn-BD").format(item.count)}</strong></div>)}</div>
        </article>
      </section>
    </div>
  );
}
