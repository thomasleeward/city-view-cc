"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AssessmentType } from "@/lib/assessments/data";

export type SaveAssessmentInput = {
  name: string;
  email: string;
  assessmentType: AssessmentType;
  answers: Record<string, number | string>;
  scores: Record<string, number>;
  primaryResult: string;
  secondaryResults: string[];
};

export async function saveAssessment(input: SaveAssessmentInput) {
  const supabase = createAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Assessment saving is not configured yet.",
    };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email || !email.includes("@")) {
    return {
      ok: false,
      message: "Please enter a valid name and email address.",
    };
  }

  const { error } = await supabase.from("assessment_submissions").insert({
    full_name: name,
    email,
    assessment_type: input.assessmentType,
    answers: input.answers,
    scores: input.scores,
    primary_result: input.primaryResult,
    secondary_results: input.secondaryResults,
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: "Your results have been saved.",
  };
}

