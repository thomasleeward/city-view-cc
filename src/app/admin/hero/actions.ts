"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeHref(value: FormDataEntryValue | null) {
  const href = String(value || "").trim();

  if (!href) {
    return "/get-connected";
  }

  if (/^(https?:\/\/|mailto:|tel:|\/)/.test(href)) {
    return href;
  }

  if (/^[^\s/]+\.[^\s]+/.test(href)) {
    return `https://${href}`;
  }

  return `/${href.replace(/^\/+/, "")}`;
}

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
    ctaHref: normalizeHref(formData.get("cta_href")),
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

  const sortOrderInput = Number(formData.get("sort_order"));
  const { data: latestSlide } = await supabase
    .from("hero_slides")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    headline: "Hero background image",
    subheadline: null,
    image_url: String(formData.get("image_url") || "") || null,
    video_url: String(formData.get("video_url") || "") || null,
    cta_label: null,
    cta_href: null,
    is_active: formData.get("is_active") === "on",
    sort_order: Number.isFinite(sortOrderInput)
      ? sortOrderInput
      : (latestSlide?.sort_order ?? 0) + 10,
  };

  const { error } = await supabase.from("hero_slides").insert(payload);

  if (error) {
    redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero?saved=image");
}

export async function updateHeroSlideOrder(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!supabase) {
    redirect("/admin/hero?error=service-role");
  }

  const id = String(formData.get("id") || "");
  const sortOrder = Number(formData.get("sort_order"));

  if (!id || !Number.isFinite(sortOrder)) {
    redirect("/admin/hero?error=invalid-order");
  }

  const { error } = await supabase
    .from("hero_slides")
    .update({ sort_order: sortOrder })
    .eq("id", id);

  if (error) {
    redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero?saved=order");
}

export async function removeHeroSlide(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!supabase) {
    redirect("/admin/hero?error=service-role");
  }

  const id = String(formData.get("id") || "");

  if (!id) {
    redirect("/admin/hero?error=missing-slide");
  }

  const { error } = await supabase
    .from("hero_slides")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect("/admin/hero?saved=removed");
}
