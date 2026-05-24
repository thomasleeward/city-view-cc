import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import { createHeroSlide } from "@/app/admin/hero/actions";
import { requireAdmin } from "@/lib/supabase/auth";
import { getHeroSlides } from "@/lib/supabase/queries";

export default async function AdminHeroPage() {
  await requireAdmin();
  const slides = await getHeroSlides();

  return (
    <AdminLayout title="Homepage Hero">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <form action={createHeroSlide} className="grid gap-5 rounded-lg bg-white p-6 shadow-sm">
          <label className="text-sm font-semibold text-ink">
            Hero headline
            <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="headline" required />
          </label>
          <label className="text-sm font-semibold text-ink">
            Subheadline
            <textarea className="mt-2 min-h-28 w-full rounded-md border border-ink/10 px-3 py-3" name="subheadline" />
          </label>
          <ImageUploader bucket="hero-images" name="image_url" label="Hero image" />
          <label className="text-sm font-semibold text-ink">
            Video background URL
            <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="video_url" type="url" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-ink">
              CTA label
              <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="cta_label" />
            </label>
            <label className="text-sm font-semibold text-ink">
              CTA href
              <input className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3" name="cta_href" />
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-ink">
            <input name="is_active" type="checkbox" defaultChecked />
            Active
          </label>
          <Button type="submit">Create Hero Slide</Button>
        </form>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="font-display text-3xl font-bold">Active Slides</h2>
          <div className="mt-5 grid gap-4">
            {slides.map((slide) => (
              <div key={slide.id} className="rounded-md border border-ink/10 p-4">
                <p className="font-semibold">{slide.headline}</p>
                {slide.subheadline && (
                  <p className="mt-1 text-sm text-muted">{slide.subheadline}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
