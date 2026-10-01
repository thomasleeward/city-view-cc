import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  if (process.env.PROOFADMIN_ENABLED === "true" || process.env.VERCEL_ENV === "preview") redirect("https://login.proofcreatives.com/admin");
  const supabase = await createClient();

  if (!supabase) {
    redirect("/admin/login?setup=missing");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login?error=not-admin");
  }

  return user;
}
