import { AdminLayout } from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/supabase/auth";
import { listPlanningCenterCustomFields } from "@/lib/planning-center";
import { CopyButton } from "./CopyButton";

const expectedFields = [
  {
    env: "PLANNING_CENTER_DISC_FIELD_ID",
    description: "DISC primary result",
  },
  {
    env: "PLANNING_CENTER_SPIRITUAL_GIFTS_FIELD_ID",
    description: "Top spiritual gifts",
  },
  {
    env: "PLANNING_CENTER_ASSESSMENT_SUMMARY_FIELD_ID",
    description: "Optional combined score summary",
  },
];

export default async function PlanningCenterIdsPage() {
  await requireAdmin();

  let fields: Awaited<ReturnType<typeof listPlanningCenterCustomFields>> = [];
  let error = "";

  try {
    fields = await listPlanningCenterCustomFields();
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Could not load Planning Center custom fields.";
  }

  return (
    <AdminLayout title="Planning Center IDs">
      <div className="grid gap-6">
        <section className="bg-white p-5 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-ink">
            Assessment env vars
          </h2>
          <p className="mt-2 text-sm text-muted">
            Create your Planning Center People custom fields, then copy the
            matching field definition IDs into `.env.local`.
          </p>
          <div className="mt-4 grid gap-3">
            {expectedFields.map((field) => (
              <div
                key={field.env}
                className="grid gap-2 rounded-md bg-cream p-4 md:grid-cols-[22rem_1fr]"
              >
                <code className="text-sm font-bold text-ink">{field.env}</code>
                <span className="text-sm text-muted">{field.description}</span>
              </div>
            ))}
          </div>
        </section>

        {error ? (
          <section className="rounded-md bg-[#fff0ed] p-5 text-sm font-semibold text-[#963528]">
            {error}
          </section>
        ) : null}

        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-ink/10 p-5">
            <h2 className="font-display text-2xl font-bold text-ink">
              People custom fields
            </h2>
            <p className="mt-2 text-sm text-muted">
              Field ID is the value to use for the Planning Center env vars.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="p-4">Field</th>
                  <th className="p-4">Field ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Tab</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Options</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id} className="border-t border-ink/10 align-top">
                    <td className="p-4 font-semibold text-ink">{field.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-cream px-2 py-1 font-bold text-ink">
                          {field.id}
                        </code>
                        <CopyButton value={field.id} />
                      </div>
                    </td>
                    <td className="p-4 text-muted">{field.dataType}</td>
                    <td className="p-4">
                      <div className="font-semibold text-ink">{field.tabName}</div>
                      {field.tabId ? (
                        <div className="mt-1 text-xs text-muted">
                          Tab ID: {field.tabId}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4 text-muted">{field.slug || "-"}</td>
                    <td className="max-w-sm p-4 text-muted">
                      {field.options.length ? field.options.join(", ") : "-"}
                    </td>
                  </tr>
                ))}
                {!fields.length && !error ? (
                  <tr>
                    <td className="p-6 text-muted" colSpan={6}>
                      No Planning Center custom fields found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

