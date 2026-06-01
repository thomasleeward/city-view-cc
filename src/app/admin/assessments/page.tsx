import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";
import { discNames, spiritualGiftNames } from "@/lib/assessments/data";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  connectPlanningCenterPerson,
  findPlanningCenterMatches,
  syncSubmissionToPlanningCenter,
} from "./actions";

type SearchParams = Promise<{
  error?: string;
  saved?: string;
  query?: string;
  matches?: string;
}>;

type Submission = {
  id: string;
  full_name: string;
  email: string;
  assessment_type: "disc" | "spiritual_gifts";
  scores: Record<string, number>;
  primary_result: string;
  pco_person_id: string | null;
  pco_synced_at: string | null;
  pco_sync_status: string | null;
  pco_sync_error: string | null;
  created_at: string;
};

function getAssessmentLabel(type: Submission["assessment_type"]) {
  return type === "disc" ? "DISC" : "Spiritual Gifts";
}

function formatScores(submission: Submission) {
  const labels =
    submission.assessment_type === "disc" ? discNames : spiritualGiftNames;

  return Object.entries(submission.scores ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([key, score]) => {
      const label = labels[key as keyof typeof labels] ?? key;
      return `${label}: ${score}`;
    })
    .join(" | ");
}

function parseMatches(value?: string) {
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as { id: string; name: string; email: string | null }[];
  } catch {
    return [];
  }
}

export default async function AdminAssessmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = createAdminClient();
  const matches = parseMatches(params.matches);

  const { data } = supabase
    ? await supabase
        .from("assessment_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const submissions = (data ?? []) as Submission[];

  return (
    <AdminLayout title="Assessments">
      <div className="mb-6 grid gap-4">
        {params.error ? (
          <div className="rounded-md bg-[#fff0ed] p-4 text-sm font-semibold text-[#963528]">
            {params.error}
          </div>
        ) : null}
        {params.saved ? (
          <div className="rounded-md bg-white p-4 text-sm font-semibold text-green shadow-sm">
            Assessment record updated.
          </div>
        ) : null}
      </div>

      <div className="mb-6 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-ink">
          Find a Planning Center person
        </h2>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row" action={findPlanningCenterMatches}>
          <input
            className="min-h-12 flex-1 rounded-md border border-ink/15 px-4"
            name="query"
            placeholder="Search by name or email"
            defaultValue={params.query}
          />
          <Button type="submit">Search</Button>
        </form>
        {matches.length ? (
          <div className="mt-4 grid gap-2 text-sm">
            {matches.map((match) => (
              <div key={match.id} className="rounded-md bg-cream p-3">
                <strong>{match.name}</strong>
                <span className="text-muted">
                  {" "}#{match.id}{match.email ? ` | ${match.email}` : ""}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="p-4">Person</th>
              <th className="p-4">Assessment</th>
              <th className="p-4">Result</th>
              <th className="p-4">Planning Center</th>
              <th className="p-4">Sync</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-t border-ink/10 align-top">
                <td className="p-4">
                  <div className="font-semibold text-ink">{submission.full_name}</div>
                  <div className="text-muted">{submission.email}</div>
                  <div className="mt-2 text-xs text-muted">
                    {new Date(submission.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="p-4 font-semibold">
                  {getAssessmentLabel(submission.assessment_type)}
                </td>
                <td className="max-w-md p-4">
                  <div className="font-semibold text-ink">{submission.primary_result}</div>
                  <div className="mt-2 text-xs text-muted">{formatScores(submission)}</div>
                </td>
                <td className="p-4">
                  <form className="grid gap-2" action={connectPlanningCenterPerson}>
                    <input name="id" type="hidden" value={submission.id} />
                    <input
                      className="min-h-10 rounded-md border border-ink/15 px-3"
                      name="pco_person_id"
                      placeholder="Person ID"
                      defaultValue={submission.pco_person_id ?? ""}
                    />
                    <Button type="submit" variant="ghost" className="min-h-10 py-2">
                      Save ID
                    </Button>
                  </form>
                </td>
                <td className="p-4">
                  <form action={syncSubmissionToPlanningCenter}>
                    <input name="id" type="hidden" value={submission.id} />
                    <input
                      name="pco_person_id"
                      type="hidden"
                      value={submission.pco_person_id ?? ""}
                    />
                    <Button type="submit" variant="secondary" className="min-h-10 py-2">
                      Sync
                    </Button>
                  </form>
                  <div className="mt-2 text-xs text-muted">
                    {submission.pco_synced_at
                      ? `Synced ${new Date(submission.pco_synced_at).toLocaleString()}`
                      : submission.pco_sync_status ?? "Not synced"}
                  </div>
                  {submission.pco_sync_error ? (
                    <div className="mt-2 max-w-xs text-xs font-semibold text-[#963528]">
                      {submission.pco_sync_error}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
            {!submissions.length ? (
              <tr>
                <td className="p-6 text-muted" colSpan={5}>
                  No assessment submissions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

