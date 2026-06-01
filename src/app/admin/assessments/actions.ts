"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  findPlanningCenterPeople,
  syncAssessmentToPlanningCenter,
} from "@/lib/planning-center";

function formatScores(scores: Record<string, number>) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key, score]) => `${key}: ${score}`)
    .join(", ");
}

export async function connectPlanningCenterPerson(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!supabase) {
    redirect("/admin/assessments?error=service-role");
  }

  const id = String(formData.get("id") || "");
  const personId = String(formData.get("pco_person_id") || "").trim();

  if (!id || !personId) {
    redirect("/admin/assessments?error=missing-person");
  }

  const { error } = await supabase
    .from("assessment_submissions")
    .update({ pco_person_id: personId })
    .eq("id", id);

  if (error) {
    redirect(`/admin/assessments?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/assessments");
  redirect("/admin/assessments?saved=connected");
}

export async function syncSubmissionToPlanningCenter(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  if (!supabase) {
    redirect("/admin/assessments?error=service-role");
  }

  const id = String(formData.get("id") || "");
  const personId = String(formData.get("pco_person_id") || "").trim();

  if (!id || !personId) {
    redirect("/admin/assessments?error=missing-person");
  }

  const { data, error } = await supabase
    .from("assessment_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    redirect("/admin/assessments?error=missing-submission");
  }

  try {
    const scores =
      data.scores && typeof data.scores === "object"
        ? (data.scores as Record<string, number>)
        : {};
    const summary = `${data.primary_result} (${formatScores(scores)})`;

    await syncAssessmentToPlanningCenter({
      personId,
      name: data.full_name,
      email: data.email,
      assessmentType: data.assessment_type,
      primaryResult: data.primary_result,
      summary,
      scores,
      selectedResults: data.secondary_results ?? [],
    });

    const { error: updateError } = await supabase
      .from("assessment_submissions")
      .update({
        pco_person_id: personId,
        pco_synced_at: new Date().toISOString(),
        pco_sync_status: "synced",
        pco_sync_error: null,
      })
      .eq("id", id);

    if (updateError) {
      redirect(
        `/admin/assessments?error=${encodeURIComponent(updateError.message)}`,
      );
    }
  } catch (syncError) {
    const message =
      syncError instanceof Error ? syncError.message : "Planning Center sync failed.";

    await supabase
      .from("assessment_submissions")
      .update({
        pco_person_id: personId,
        pco_sync_status: "failed",
        pco_sync_error: message,
      })
      .eq("id", id);

    redirect(`/admin/assessments?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/assessments");
  redirect("/admin/assessments?saved=synced");
}

export async function findPlanningCenterMatches(formData: FormData) {
  await requireAdmin();
  const query = String(formData.get("query") || "").trim();

  if (!query) {
    redirect("/admin/assessments?error=missing-query");
  }

  let matches: Awaited<ReturnType<typeof findPlanningCenterPeople>>;

  try {
    matches = await findPlanningCenterPeople(query);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Planning Center search failed.";
    redirect(`/admin/assessments?error=${encodeURIComponent(message)}`);
  }

  const params = new URLSearchParams({
    query,
    matches: JSON.stringify(matches),
  });
  redirect(`/admin/assessments?${params.toString()}`);
}
