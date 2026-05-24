import { AdminNav } from "@/components/admin/AdminNav";

export function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
              City View Admin
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink">
              {title}
            </h1>
          </div>
          <AdminNav />
        </div>
        {children}
      </div>
    </main>
  );
}
