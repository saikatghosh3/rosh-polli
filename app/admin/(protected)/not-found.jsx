import { NotFoundState } from "@/components/states";

export default function AdminProtectedNotFound() {
  return (
    <div className="admin-notfound">
      <NotFoundState
        entity="পৃষ্ঠা"
        primaryAction={{ href: "/admin/dashboard", children: "ড্যাশবোর্ডে ফিরুন" }}
        secondaryAction={{ href: "/products", children: "স্টোর দেখুন" }}
      />
    </div>
  );
}
