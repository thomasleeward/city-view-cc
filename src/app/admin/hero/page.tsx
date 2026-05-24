import Image from "next/image";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import {
  createHeroSlide,
  removeHeroSlide,
  updateHeroSlideOrder,
  updateHeroContent,
} from "@/app/admin/hero/actions";
import { requireAdmin } from "@/lib/supabase/auth";
import { getHeroContent, getHeroSlides } from "@/lib/supabase/queries";

export default async function AdminHeroPage() {
  await requireAdmin();
  const [content, slides] = await Promise.all([getHeroContent(), getHeroSlides()]);

  return (
    <AdminLayout title="Homepage Hero">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-8">
          <form
            action={updateHeroContent}
            className="grid gap-5 rounded-lg bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="font-display text-3xl font-bold">Hero Text</h2>
              <p className="mt-2 text-sm text-muted">
                This text stays fixed while the background images rotate.
              </p>
            </div>
            <label className="text-sm font-semibold text-ink">
              Eyebrow
              <input
                className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
                name="eyebrow"
                defaultValue={content.eyebrow}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Headline
              <input
                className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
                name="headline"
                defaultValue={content.headline}
                required
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Subheadline
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-ink/10 px-3 py-3"
                name="subheadline"
                defaultValue={content.subheadline}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-ink">
                CTA label
                <input
                  className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
                  name="cta_label"
                  defaultValue={content.ctaLabel}
                />
              </label>
              <label className="text-sm font-semibold text-ink">
                CTA href
                <input
                  className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
                  name="cta_href"
                  defaultValue={content.ctaHref}
                />
              </label>
            </div>
            <Button type="submit">Save Hero Text</Button>
          </form>

          <form
            action={createHeroSlide}
            className="grid gap-5 rounded-lg bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="font-display text-3xl font-bold">Rotating Images</h2>
              <p className="mt-2 text-sm text-muted">
                Add active images for the homepage hero background carousel.
              </p>
            </div>
            <ImageUploader
              bucket="hero-images"
              name="image_url"
              label="Hero image"
              minWidth={2400}
              minHeight={1400}
              recommendedSize="For sharp full-width hero backgrounds, upload landscape images at least 2400x1400."
            />
            <label className="text-sm font-semibold text-ink">
              Optional video background URL
              <input
                className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
                name="video_url"
                type="url"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Display order
              <input
                className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
                name="sort_order"
                placeholder="Leave blank to add to the end"
                type="number"
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <input name="is_active" type="checkbox" defaultChecked />
              Active
            </label>
            <Button type="submit">Add Hero Image</Button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="font-display text-3xl font-bold">Active Backgrounds</h2>
          <div className="mt-5 grid gap-4">
            {slides.map((slide) => (
              <div key={slide.id} className="rounded-md border border-ink/10 p-3">
                {slide.imageUrl ? (
                  <div className="relative aspect-video overflow-hidden rounded-md bg-cream">
                    <Image
                      src={slide.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-md bg-cream p-4 text-sm text-muted">
                    Video background only
                  </div>
                )}
                {slide.id !== "fallback" && (
                  <div className="mt-3 grid gap-3">
                    <form
                      action={updateHeroSlideOrder}
                      className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"
                    >
                      <input name="id" type="hidden" value={slide.id} />
                      <label className="text-sm font-semibold text-ink">
                        Rotation order
                        <input
                          className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2"
                          name="sort_order"
                          type="number"
                          defaultValue={slide.sortOrder}
                        />
                      </label>
                      <button
                        className="rounded-md bg-green px-4 py-2 text-sm font-bold text-white transition hover:bg-green/90"
                        type="submit"
                      >
                        Save Order
                      </button>
                    </form>
                    <form action={removeHeroSlide}>
                      <input name="id" type="hidden" value={slide.id} />
                      <button
                        className="w-full rounded-md border border-terracotta/30 px-3 py-2 text-sm font-bold text-terracotta transition hover:bg-terracotta hover:text-white"
                        type="submit"
                      >
                        Remove from rotation
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
