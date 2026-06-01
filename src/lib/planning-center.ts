type PlanningCenterResource = {
  type?: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: { id: string; type: string } | null }>;
};

type PlanningCenterListResponse = {
  data?: PlanningCenterResource[];
  included?: PlanningCenterResource[];
  links?: {
    next?: string | null;
  };
};

type PlanningCenterSingleResponse = {
  data?: PlanningCenterResource;
};

type DiscScores = {
  D?: number;
  I?: number;
  S?: number;
  C?: number;
};

export type PlanningCenterPersonMatch = {
  id: string;
  name: string;
  email: string | null;
};

const baseUrl = "https://api.planningcenteronline.com";

const defaultFieldIds = {
  discResult: "1064952",
  discDScore: "1064953",
  discIScore: "1064954",
  discSScore: "1064955",
  discCScore: "1064956",
  spiritualGifts: "1051090",
};

const spiritualGiftPcoValues: Record<string, string> = {
  administration: "Administration",
  discernment: "Discernment",
  encouragement: "Exhortation",
  evangelism: "Evangelism",
  faith: "Faith",
  giving: "Giving",
  healing: "Healing",
  hospitality: "Hospitality",
  knowledge: "Knowledge",
  leadership: "Leadership",
  mercy: "Mercy",
  prophecy: "Prophecy",
  shepherding: "Shepherding/Pastoring",
  serving: "Service/Helps",
  teaching: "Teaching",
  wisdom: "Wisdom",
  "Encouragement / Exhortation": "Exhortation",
  "Mercy / Compassion": "Mercy",
  "Serving / Helps": "Service/Helps",
  "Shepherding / Pastoring": "Shepherding/Pastoring",
};

function envOrDefault(name: string, fallback: string) {
  return process.env[name] || fallback;
}

function getPlanningCenterHeaders() {
  const appId = process.env.PLANNING_CENTER_APP_ID;
  const secret = process.env.PLANNING_CENTER_SECRET;

  if (!appId || !secret) {
    return null;
  }

  const token = Buffer.from(`${appId}:${secret}`).toString("base64");

  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  };
}

async function planningCenterFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = getPlanningCenterHeaders();

  if (!headers) {
    throw new Error("Planning Center credentials are not configured.");
  }

  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Planning Center request failed (${response.status}): ${message}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function planningCenterFetchAll(path: string): Promise<{
  records: PlanningCenterResource[];
  included: PlanningCenterResource[];
}> {
  const records: PlanningCenterResource[] = [];
  const included: PlanningCenterResource[] = [];
  let nextPath: string | null = path;

  while (nextPath) {
    const response: PlanningCenterListResponse =
      await planningCenterFetch<PlanningCenterListResponse>(
      nextPath,
    );
    records.push(...(response.data ?? []));
    included.push(...(response.included ?? []));
    nextPath = response.links?.next ?? null;
  }

  return { records, included };
}

function attrString(
  resource: PlanningCenterResource,
  key: string,
  fallback = "",
) {
  const value = resource.attributes?.[key];
  return typeof value === "string" ? value : fallback;
}

function attrNumber(resource: PlanningCenterResource, key: string) {
  const value = resource.attributes?.[key];
  return typeof value === "number" ? value : 0;
}

export async function findPlanningCenterPeople(query: string) {
  const params = new URLSearchParams({
    "where[search_name_or_email]": query,
    per_page: "5",
  });

  const result = await planningCenterFetch<PlanningCenterListResponse>(
    `/people/v2/people?${params.toString()}`,
  );

  return (result.data ?? []).map((person) => ({
    id: person.id,
    name:
      typeof person.attributes?.name === "string"
        ? person.attributes.name
        : `Planning Center #${person.id}`,
    email:
      typeof person.attributes?.login_identifier === "string"
        ? person.attributes.login_identifier
        : null,
  }));
}

export type PlanningCenterCustomField = {
  id: string;
  name: string;
  slug: string;
  dataType: string;
  tabId: string | null;
  tabName: string;
  sequence: number;
  options: string[];
};

export async function listPlanningCenterCustomFields() {
  const { records, included } = await planningCenterFetchAll(
    "/people/v2/field_definitions?include=tab,field_options&per_page=100&order=tab_id",
  );

  const tabs = new Map(
    included
      .filter((resource) => resource.type === "Tab")
      .map((tab) => [tab.id, attrString(tab, "name", `Tab #${tab.id}`)]),
  );

  const optionsByField = new Map<string, string[]>();

  included
    .filter((resource) => resource.type === "FieldOption")
    .forEach((option) => {
      const fieldId =
        option.relationships?.field_definition?.data?.id ??
        attrString(option, "field_definition_id");
      const value = attrString(option, "value");

      if (!fieldId || !value) {
        return;
      }

      optionsByField.set(fieldId, [
        ...(optionsByField.get(fieldId) ?? []),
        value,
      ]);
    });

  return records
    .map((field) => {
      const tabId =
        field.relationships?.tab?.data?.id ?? attrString(field, "tab_id") ?? null;

      return {
        id: field.id,
        name: attrString(field, "name", `Field #${field.id}`),
        slug: attrString(field, "slug"),
        dataType: attrString(field, "data_type"),
        tabId,
        tabName: tabId ? (tabs.get(tabId) ?? `Tab #${tabId}`) : "No tab",
        sequence: attrNumber(field, "sequence"),
        options: optionsByField.get(field.id) ?? [],
      };
    })
    .sort((a, b) => {
      const tabSort = a.tabName.localeCompare(b.tabName);
      return tabSort || a.sequence - b.sequence || a.name.localeCompare(b.name);
    });
}

async function upsertFieldDatum(
  personId: string,
  fieldDefinitionId: string,
  value: string,
) {
  const params = new URLSearchParams({
    "where[field_definition_id]": fieldDefinitionId,
    per_page: "1",
  });

  const existing = await planningCenterFetch<PlanningCenterListResponse>(
    `/people/v2/people/${personId}/field_data?${params.toString()}`,
  );

  const fieldDatumId = existing.data?.[0]?.id;
  const body = JSON.stringify({
    data: {
      attributes: {
        field_definition_id: fieldDefinitionId,
        value,
      },
    },
  });

  if (fieldDatumId) {
    await planningCenterFetch<PlanningCenterSingleResponse>(
      `/people/v2/field_data/${fieldDatumId}`,
      {
        method: "PATCH",
        body,
      },
    );
    return;
  }

  await planningCenterFetch<PlanningCenterSingleResponse>(
    `/people/v2/people/${personId}/field_data`,
    {
      method: "POST",
      body,
    },
  );
}

async function createFieldDatum(
  personId: string,
  fieldDefinitionId: string,
  value: string,
) {
  await planningCenterFetch<PlanningCenterSingleResponse>(
    `/people/v2/people/${personId}/field_data`,
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          attributes: {
            field_definition_id: fieldDefinitionId,
            value,
          },
        },
      }),
    },
  );
}

async function deleteFieldDatum(personId: string, fieldDatumId: string) {
  await planningCenterFetch<unknown>(
    `/people/v2/people/${personId}/field_data/${fieldDatumId}`,
    {
      method: "DELETE",
    },
  );
}

async function syncCheckboxFieldValues(
  personId: string,
  fieldDefinitionId: string,
  values: string[],
) {
  const params = new URLSearchParams({
    "where[field_definition_id]": fieldDefinitionId,
    per_page: "100",
  });

  const existing = await planningCenterFetch<PlanningCenterListResponse>(
    `/people/v2/people/${personId}/field_data?${params.toString()}`,
  );
  const desiredValues = new Set(values.map((value) => value.trim()).filter(Boolean));
  const existingValues = new Map(
    (existing.data ?? []).map((datum) => [
      attrString(datum, "value"),
      datum.id,
    ]),
  );

  await Promise.all(
    (existing.data ?? [])
      .filter((datum) => !desiredValues.has(attrString(datum, "value")))
      .map((datum) => deleteFieldDatum(personId, datum.id)),
  );

  await Promise.all(
    [...desiredValues]
      .filter((value) => !existingValues.has(value))
      .map((value) => createFieldDatum(personId, fieldDefinitionId, value)),
  );
}

function normalizeSpiritualGiftValue(value: string) {
  return spiritualGiftPcoValues[value] ?? value;
}

export async function syncAssessmentToPlanningCenter({
  personId,
  assessmentType,
  primaryResult,
  summary,
  scores,
  selectedResults,
}: {
  personId: string;
  assessmentType: "disc" | "spiritual_gifts";
  primaryResult: string;
  summary: string;
  scores: Record<string, number>;
  selectedResults: string[];
}) {
  const summaryField = process.env.PLANNING_CENTER_ASSESSMENT_SUMMARY_FIELD_ID;

  if (assessmentType === "disc") {
    const discResultField = envOrDefault(
      "PLANNING_CENTER_DISC_FIELD_ID",
      defaultFieldIds.discResult,
    );
    const discScoreFields = {
      D: envOrDefault(
        "PLANNING_CENTER_DISC_D_SCORE_FIELD_ID",
        defaultFieldIds.discDScore,
      ),
      I: envOrDefault(
        "PLANNING_CENTER_DISC_I_SCORE_FIELD_ID",
        defaultFieldIds.discIScore,
      ),
      S: envOrDefault(
        "PLANNING_CENTER_DISC_S_SCORE_FIELD_ID",
        defaultFieldIds.discSScore,
      ),
      C: envOrDefault(
        "PLANNING_CENTER_DISC_C_SCORE_FIELD_ID",
        defaultFieldIds.discCScore,
      ),
    };
    const discScores = scores as DiscScores;

    await upsertFieldDatum(personId, discResultField, primaryResult);

    await Promise.all(
      Object.entries(discScoreFields).map(([key, fieldId]) =>
        upsertFieldDatum(
          personId,
          fieldId,
          String(discScores[key as keyof DiscScores] ?? 0),
        ),
      ),
    );
  } else {
    const spiritualGiftsField = envOrDefault(
      "PLANNING_CENTER_SPIRITUAL_GIFTS_FIELD_ID",
      defaultFieldIds.spiritualGifts,
    );
    const values = selectedResults.map(normalizeSpiritualGiftValue);

    await syncCheckboxFieldValues(personId, spiritualGiftsField, values);
  }

  if (summaryField) {
    await upsertFieldDatum(personId, summaryField, summary);
  }
}
