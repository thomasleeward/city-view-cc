import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="font-display text-3xl font-bold">Sermon Series</h2>
          <p className="mt-3 text-muted">
            Add new sermon series, images, dates, and YouTube playlist links.
          </p>
          <Button href="/admin/sermons/new" className="mt-6">
            Add Series
          </Button>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="font-display text-3xl font-bold">Homepage Hero</h2>
          <p className="mt-3 text-muted">
            Add active hero slides with images now and video URLs later.
          </p>
          <Button href="/admin/hero" className="mt-6">
            Manage Hero
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
