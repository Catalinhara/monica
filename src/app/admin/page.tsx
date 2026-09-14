"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(
  () =>
    import("@/components/admin/AdminApp").then((mod) => mod.AdminApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center text-[var(--muted)]">
        Cargando editor…
      </div>
    ),
  },
);

export default function AdminPage() {
  return <AdminApp />;
}
