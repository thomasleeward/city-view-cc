import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import { createSermonSeries } from "@/app/admin/sermons/actions";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function NewSermonSeriesPage() {
  await requireAdmin();

  return (
    <AdminLayout title="Add Sermon Series">
      <form action={createSermonSeries} className="grid max-w-2xl gap-5 rounded-lg bg-white p-6 shadow-sm">
        <label className="text-sm font-semibold text-ink">
          Series name
          <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="name" required />
        </label>
        <label className="text-sm font-semibold text-ink">
          Series dates label
          <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="date_label" placeholder="5/3/2026-Present" required />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">
            Start date
            <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="start_date" type="date" required />
          </label>
          <label className="text-sm font-semibold text-ink">
            End date
            <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="end_date" type="date" />
          </label>
        </div>
        <ImageUploader bucket="sermon-images" name="image_url" label="Series image" />
        <label className="text-sm font-semibold text-ink">
          YouTube playlist URL
          <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="youtube_playlist_url" type="url" required />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input name="is_published" type="checkbox" defaultChecked />
          Publish on Sermon Archive
        </label>
        <Button type="submit">Create Series</Button>
      </form>
    </AdminLayout>
  );
}
