import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSermonSeries } from "@/lib/supabase/queries";

export default async function AdminSermonsPage() {
  await requireAdmin();
  const series = await getSermonSeries();

  return (
    <AdminLayout title="Sermon Series">
      <div className="mb-6 flex justify-end">
        <Button href="/admin/sermons/new">Add New Series</Button>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="p-4">Series</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Playlist</th>
            </tr>
          </thead>
          <tbody>
            {series.map((item) => (
              <tr key={item.id} className="border-t border-ink/10">
                <td className="p-4 font-semibold">{item.name}</td>
                <td className="p-4 text-muted">{item.dateLabel}</td>
                <td className="p-4">
                  <a className="text-terracotta underline" href={item.youtubePlaylistUrl}>
                    YouTube
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
