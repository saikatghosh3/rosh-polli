export default function AdminDataNotice({ title = "তথ্য লোড করা যায়নি", message = "ডেটাবেস সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।" }) {
  return <section className="admin-data-notice" role="alert"><span className="eyebrow">অ্যাডমিন স্টুডিও</span><h1>{title}</h1><p>{message}</p><a href="/admin/login" className="text-link">লগইন পেজে ফিরুন</a></section>;
}
