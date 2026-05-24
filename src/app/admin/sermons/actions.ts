"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createSermonSeries(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!supabase) {
    redirect("/admin/sermons/new?error=service-role");
  }

  const payload = {
    name: String(formData.get("name") ?? ""),
    date_label: String(formData.get("date_label") ?? ""),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") || "") || null,
    image_url: String(formData.get("image_url") || "") || null,
    youtube_playlist_url: String(formData.get("youtube_playlist_url") ?? ""),
    is_published: formData.get("is_published") === "on",
  };

  const { error } = await supabase.from("sermon_series").insert(payload);

  if (error) {
    redirect(`/admin/sermons/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/sermon-archive");
  revalidatePath("/admin/sermons");
  redirect("/admin/sermons");
}
