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

type PlanningCenterUploadResponse = {
  data?: Array<{
    id: string;
  }>;
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
  spiritualGiftsPdf: "1051059",
};

const spiritualGiftPcoValues: Record<string, string> = {
  administration:
    "Administration: Organizing and guiding church activities and goals",
  discernment: "Discernment: Recognizing truth from error and distinguishing spirits",
  encouragement: "Exhortation: Encouraging and motivating others in faith",
  evangelism: "Evangelism: Sharing the gospel and leading others to Christ",
  faith: "Faith: Trusting God to accomplish His purposes and encouraging others",
  healing: "Healing: Miraculous ability to restore health",
  knowledge: "Knowledge: Understanding and teaching God's Word effectively",
  leadership: "Leadership: Guiding and inspiring others to serve God",
  mercy: "Mercy: Showing compassion and care for those in need",
  prophecy: "Prophecy: Speaking God's message boldly and accurately",
  shepherding:
    "Shepherding/Pastoring: Caring for the spiritual well-being of others",
  serving: "Service/Helps: Assisting others with practical needs",
  teaching: "Teaching: Instructing others in God's Word",
  wisdom:
    "Wisdom: The ability to apply knowledge and discern God's will in practical ways",
  "Encouragement / Exhortation":
    "Exhortation: Encouraging and motivating others in faith",
  "Mercy / Compassion": "Mercy: Showing compassion and care for those in need",
  "Serving / Helps": "Service/Helps: Assisting others with practical needs",
  "Shepherding / Pastoring":
    "Shepherding/Pastoring: Caring for the spiritual well-being of others",
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

function getPlanningCenterUploadHeaders() {
  const appId = process.env.PLANNING_CENTER_APP_ID;
  const secret = process.env.PLANNING_CENTER_SECRET;

  if (!appId || !secret) {
    return null;
  }

  const token = Buffer.from(`${appId}:${secret}`).toString("base64");

  return {
    Authorization: `Basic ${token}`,
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

async function uploadPlanningCenterFile(file: Blob, filename: string) {
  const headers = getPlanningCenterUploadHeaders();

  if (!headers) {
    throw new Error("Planning Center credentials are not configured.");
  }

  const formData = new FormData();
  formData.append("file", file, filename);

  const response = await fetch("https://upload.planningcenteronline.com/v2/files", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Planning Center file upload failed (${response.status}): ${message}`,
    );
  }

  const result = (await response.json()) as PlanningCenterUploadResponse;
  const fileId = result.data?.[0]?.id;

  if (!fileId) {
    throw new Error("Planning Center file upload did not return a file id.");
  }

  return fileId;
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

async function getFieldOptionValues(fieldDefinitionId: string) {
  const { records } = await planningCenterFetchAll(
    `/people/v2/field_definitions/${fieldDefinitionId}/field_options?per_page=100`,
  );

  return records.map((record) => attrString(record, "value")).filter(Boolean);
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

async function deleteFieldDatum(fieldDatumId: string) {
  await planningCenterFetch<unknown>(
    `/people/v2/field_data/${fieldDatumId}`,
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
  const optionValues = await getFieldOptionValues(fieldDefinitionId);
  const resolvedValues = values
    .map((value) => resolveCheckboxOption(value, optionValues))
    .filter((value): value is string => Boolean(value));
  const missingOptions = values.filter(
    (value) => !resolveCheckboxOption(value, optionValues),
  );

  if (missingOptions.length) {
    throw new Error(
      `Missing Planning Center checkbox option(s): ${missingOptions.join(", ")}`,
    );
  }

  const desiredValues = new Set(resolvedValues);
  const existingValues = new Map(
    (existing.data ?? []).map((datum) => [
      attrString(datum, "value"),
      datum.id,
    ]),
  );

  await Promise.all(
    (existing.data ?? [])
      .filter((datum) => !desiredValues.has(attrString(datum, "value")))
      .map((datum) => deleteFieldDatum(datum.id)),
  );

  await Promise.all(
    [...desiredValues]
      .filter((value) => !existingValues.has(value))
      .map((value) => createFieldDatum(personId, fieldDefinitionId, value)),
  );
}

function comparableOption(value: string) {
  return normalizePdfText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function optionPrefix(value: string) {
  return value.split(":")[0]?.trim() ?? value;
}

function resolveCheckboxOption(value: string, optionValues: string[]) {
  const trimmed = value.trim();
  const comparableValue = comparableOption(trimmed);
  const comparablePrefix = comparableOption(optionPrefix(trimmed));

  return (
    optionValues.find((option) => comparableOption(option) === comparableValue) ??
    optionValues.find(
      (option) => comparableOption(optionPrefix(option)) === comparablePrefix,
    ) ??
    null
  );
}

function normalizeSpiritualGiftValue(value: string) {
  return spiritualGiftPcoValues[value] ?? value;
}

function normalizePdfText(value: string) {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function escapePdfText(value: string) {
  return normalizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapPdfLine(line: string, maxLength = 88) {
  const words = normalizePdfText(line).split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function createSimplePdf(lines: string[]) {
  const pageLines = lines.flatMap((line) => wrapPdfLine(line));
  const linesPerPage = 42;
  const pages: string[][] = [];

  for (let i = 0; i < pageLines.length; i += linesPerPage) {
    pages.push(pageLines.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds: number[] = [];

  pages.forEach((page) => {
    const stream = [
      "BT",
      "/F1 11 Tf",
      "72 742 Td",
      "15 TL",
      ...page.map((line) => `(${escapePdfText(line)}) Tj T*`),
      "ET",
    ].join("\n");
    const contentId = addObject(
      `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
    );
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  });

  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = "<< /Type /Catalog /Pages 2 0 R >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([Buffer.from(pdf, "utf8")], { type: "application/pdf" });
}

function buildSpiritualGiftsPdf({
  name,
  email,
  primaryResult,
  scores,
}: {
  name: string;
  email: string;
  primaryResult: string;
  scores: Record<string, number>;
}) {
  const scoreLines = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([gift, score]) => `${gift}: ${score}`);

  return createSimplePdf([
    "City View Community Church",
    "Spiritual Gifts Assessment Results",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}`,
    "",
    `Top Gifts: ${primaryResult}`,
    "",
    "All Spiritual Gift Scores",
    ...scoreLines,
  ]);
}

async function syncSpiritualGiftsPdf({
  personId,
  name,
  email,
  primaryResult,
  scores,
}: {
  personId: string;
  name: string;
  email: string;
  primaryResult: string;
  scores: Record<string, number>;
}) {
  const fieldId = envOrDefault(
    "PLANNING_CENTER_SPIRITUAL_GIFTS_PDF_FIELD_ID",
    defaultFieldIds.spiritualGiftsPdf,
  );
  const safeName = normalizePdfText(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "participant";
  const pdf = buildSpiritualGiftsPdf({ name, email, primaryResult, scores });
  const fileId = await uploadPlanningCenterFile(
    pdf,
    `${safeName}-spiritual-gifts-results.pdf`,
  );

  await upsertFieldDatum(personId, fieldId, fileId);
}

export async function syncAssessmentToPlanningCenter({
  personId,
  name,
  email,
  assessmentType,
  primaryResult,
  summary,
  scores,
  selectedResults,
}: {
  personId: string;
  name: string;
  email: string;
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
    await syncSpiritualGiftsPdf({
      personId,
      name,
      email,
      primaryResult,
      scores,
    });
  }

  if (summaryField) {
    await upsertFieldDatum(personId, summaryField, summary);
  }
}
