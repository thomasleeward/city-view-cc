"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateHeroContent(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!supabase) {
    redirect("/admin/hero?error=service-role");
  }

  const value = {
    eyebrow: String(formData.get("eyebrow") || "City View Community Church"),
    headline: String(formData.get("headline") || ""),
    subheadline: String(formData.get("subheadline") || ""),
    ctaLabel: String(formData.get("cta_label") || "Plan Your Visit"),
    ctaHref: String(formData.get("cta_href") || "/get-connected"),
  };

  const { error } = await supabase.from("site_settings").upsert({
    key: "homepage_hero",
    value,
  });

  if (error) {
    redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero?saved=text");
}

export async function createHeroSlide(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!supabase) {
    redirect("/admin/hero?error=service-role");
  }

  const payload = {
    headline: "Hero background image",
    subheadline: null,
    image_url: String(formData.get("image_url") || "") || null,
    video_url: String(formData.get("video_url") || "") || null,
    cta_label: null,
    cta_href: null,
    is_active: formData.get("is_active") === "on",
  };

  const { error } = await supabase.from("hero_slides").insert(payload);

  if (error) {
    redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero?saved=image");
}
