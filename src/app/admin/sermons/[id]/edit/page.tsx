import { notFound } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import { updateSermonSeries } from "@/app/admin/sermons/actions";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSermonSeriesById } from "@/lib/supabase/queries";

export default async function EditSermonSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const series = await getSermonSeriesById(id);

  if (!series) {
    notFound();
  }

  return (
    <AdminLayout title="Edit Sermon Series">
      <form
        action={updateSermonSeries}
        className="grid max-w-2xl gap-5 rounded-lg bg-white p-6 shadow-sm"
      >
        <input name="id" type="hidden" value={series.id} />
        <label className="text-sm font-semibold text-ink">
          Series name
          <input
            className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
            name="name"
            defaultValue={series.name}
            required
          />
        </label>
        <label className="text-sm font-semibold text-ink">
          Series dates label
          <input
            className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
            name="date_label"
            defaultValue={series.dateLabel}
            required
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">
            Start date
            <input
              className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
              name="start_date"
              type="date"
              defaultValue={series.startDate}
              required
            />
          </label>
          <label className="text-sm font-semibold text-ink">
            End date
            <input
              className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
              name="end_date"
              type="date"
              defaultValue={series.endDate ?? ""}
            />
          </label>
        </div>
        <ImageUploader
          bucket="sermon-images"
          name="image_url"
          label="Series image"
          defaultValue={series.imageUrl}
        />
        <label className="text-sm font-semibold text-ink">
          YouTube playlist URL
          <input
            className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
            name="youtube_playlist_url"
            type="url"
            defaultValue={series.youtubePlaylistUrl}
            required
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            name="is_published"
            type="checkbox"
            defaultChecked={series.isPublished}
          />
          Publish on Sermon Archive
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit">Save Changes</Button>
          <Button href="/admin/sermons" variant="ghost">
            Cancel
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
