"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, ClipboardList, Gift, UserRound } from "lucide-react";
import {
  discNames,
  discQuestions,
  spiritualGifts,
  spiritualGiftNames,
  spiritualGiftQuestions,
  type AssessmentType,
  type DiscKey,
  type SpiritualGiftKey,
} from "@/lib/assessments/data";
import { saveAssessment } from "./actions";

type Participant = {
  name: string;
  email: string;
};

type SavedState = Partial<Record<AssessmentType, string>>;

const discColors: Record<DiscKey, string> = {
  D: "bg-[#b94a3f]",
  I: "bg-[#c98b2f]",
  S: "bg-green",
  C: "bg-[#3f6f91]",
};

function getTopKeys<T extends string>(scores: Record<T, number>) {
  const entries = Object.entries(scores) as [T, number][];
  const max = Math.max(...entries.map(([, score]) => score));
  return entries.filter(([, score]) => score === max).map(([key]) => key);
}

function DiscAssessment({
  participant,
  onSaved,
}: {
  participant: Participant;
  onSaved: (type: AssessmentType, message: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    scores: Record<DiscKey, number>;
    topKeys: DiscKey[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / discQuestions.length) * 100);

  function submit() {
    if (answeredCount !== discQuestions.length) {
      setError("Please answer every DISC set before viewing your results.");
      return;
    }

    const scores: Record<DiscKey, number> = { D: 0, I: 0, S: 0, C: 0 };
    discQuestions.forEach((question, index) => {
      scores[question.keys[answers[index]]]++;
    });

    const topKeys = getTopKeys(scores);
    setResult({ scores, topKeys });
    setError("");

    startTransition(async () => {
      const response = await saveAssessment({
        name: participant.name,
        email: participant.email,
        assessmentType: "disc",
        answers,
        scores,
        primaryResult: topKeys.map((key) => `${discNames[key]} (${key})`).join(" & "),
        secondaryResults: topKeys,
      });
      onSaved("disc", response.message);
    });
  }

  return (
    <section className="bg-white px-5 py-8 shadow-sm sm:px-8">
      <div className="flex flex-col gap-4 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-terracotta">
            <ClipboardList size={18} />
            DISC Assessment
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            Choose the word that most identifies you.
          </h2>
        </div>
        <div className="min-w-48">
          <div className="flex justify-between text-sm font-semibold text-muted">
            <span>{answeredCount} of {discQuestions.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-terracotta transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {discQuestions.map((question, index) => (
          <fieldset
            key={question.words.join("-")}
            className="border-b border-ink/10 pb-5"
          >
            <legend className="mb-3 font-bold text-ink">Set {index + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {question.words.map((word, optionIndex) => (
                <label
                  key={word}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-semibold transition ${
                    answers[index] === optionIndex
                      ? "border-terracotta bg-terracotta/10 text-ink"
                      : "border-ink/10 bg-white text-muted hover:border-terracotta"
                  }`}
                >
                  <input
                    className="size-4"
                    name={`disc-${index}`}
                    type="radio"
                    checked={answers[index] === optionIndex}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [index]: optionIndex,
                      }))
                    }
                  />
                  {word}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {error ? <p className="mt-5 font-semibold text-[#a33b31]">{error}</p> : null}
      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-terracotta px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#a65735] disabled:opacity-60"
        type="button"
        disabled={isPending}
        onClick={submit}
      >
        {isPending ? "Saving Results..." : "View My DISC Profile"}
      </button>

      {result ? (
        <div className="mt-8 border-t border-ink/10 pt-6">
          <h3 className="font-display text-2xl font-bold text-ink">
            Your DISC Scores
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {(Object.entries(result.scores) as [DiscKey, number][]).map(
              ([key, score]) => (
                <div
                  key={key}
                  className={`rounded-md ${discColors[key]} p-5 text-center text-white`}
                >
                  <div className="text-2xl font-bold">{key}</div>
                  <div className="text-sm font-semibold">{discNames[key]}</div>
                  <div className="mt-2 text-3xl font-bold">{score}</div>
                </div>
              ),
            )}
          </div>
          <p className="mt-5 rounded-md bg-cream p-5 text-center text-xl font-bold text-ink">
            {result.topKeys.length > 1 ? "Versatile: " : ""}
            {result.topKeys.map((key) => `${discNames[key]} (${key})`).join(" & ")}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function SpiritualGiftsAssessment({
  participant,
  onSaved,
}: {
  participant: Participant;
  onSaved: (type: AssessmentType, message: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    scores: Record<SpiritualGiftKey, number>;
    topKeys: SpiritualGiftKey[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(
    (answeredCount / spiritualGiftQuestions.length) * 100,
  );

  const sortedResults = useMemo(() => {
    if (!result) {
      return [];
    }

    return (Object.entries(result.scores) as [SpiritualGiftKey, number][]).sort(
      (a, b) => b[1] - a[1],
    );
  }, [result]);

  const giftsByKey = useMemo(
    () =>
      Object.fromEntries(
        spiritualGifts.map((gift) => [gift.key, gift]),
      ) as Record<SpiritualGiftKey, (typeof spiritualGifts)[number]>,
    [],
  );

  function submit() {
    if (answeredCount !== spiritualGiftQuestions.length) {
      setError("Please answer every spiritual gifts question before viewing your results.");
      return;
    }

    const scores = Object.keys(spiritualGiftNames).reduce(
      (accumulator, key) => ({
        ...accumulator,
        [key]: 0,
      }),
      {} as Record<SpiritualGiftKey, number>,
    );

    spiritualGiftQuestions.forEach((question, index) => {
      scores[question.gift] += answers[index];
    });

    const topKeys = (Object.entries(scores) as [SpiritualGiftKey, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => key);

    setResult({ scores, topKeys });
    setError("");

    startTransition(async () => {
      const response = await saveAssessment({
        name: participant.name,
        email: participant.email,
        assessmentType: "spiritual_gifts",
        answers,
        scores,
        primaryResult: topKeys.map((key) => spiritualGiftNames[key]).join(", "),
        secondaryResults: topKeys,
      });
      onSaved("spiritual_gifts", response.message);
    });
  }

  return (
    <section className="bg-white px-5 py-8 shadow-sm sm:px-8">
      <div className="flex flex-col gap-4 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-green">
            <Gift size={18} />
            Spiritual Gifts Assessment
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            Rate how true each statement is for you.
          </h2>
          <p className="mt-2 text-sm text-muted">
            1 = Not at all like me, 5 = Definitely like me
          </p>
        </div>
        <div className="min-w-48">
          <div className="flex justify-between text-sm font-semibold text-muted">
            <span>{answeredCount} of {spiritualGiftQuestions.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-green transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        {spiritualGiftQuestions.map((question, index) => (
          <fieldset
            key={question.prompt}
            className="border-b border-ink/10 pb-5"
          >
            <legend className="font-semibold text-ink">
              {index + 1}. {question.prompt}
            </legend>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border text-sm font-bold transition ${
                    answers[index] === value
                      ? "border-green bg-green text-white"
                      : "border-ink/10 bg-white text-muted hover:border-green"
                  }`}
                  title={
                    {
                      1: "Not at all like me",
                      2: "Rarely like me",
                      3: "Somewhat like me",
                      4: "Often like me",
                      5: "Definitely like me",
                    }[value]
                  }
                >
                  <input
                    className="sr-only"
                    name={`gift-${index}`}
                    type="radio"
                    checked={answers[index] === value}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [index]: value,
                      }))
                    }
                  />
                  {value}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {error ? <p className="mt-5 font-semibold text-[#a33b31]">{error}</p> : null}
      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-green px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#4a6f63] disabled:opacity-60"
        type="button"
        disabled={isPending}
        onClick={submit}
      >
        {isPending ? "Saving Results..." : "View My Spiritual Gifts"}
      </button>

      {result ? (
        <div className="mt-8 border-t border-ink/10 pt-6">
          <h3 className="font-display text-2xl font-bold text-ink">
            Your Top Gifts
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {result.topKeys.map((key) => (
              <div key={key} className="rounded-md bg-cream p-5">
                <div className="text-sm font-bold uppercase tracking-wide text-green">
                  Spiritual Gift
                </div>
                <div className="mt-2 font-display text-2xl font-bold text-ink">
                  {spiritualGiftNames[key]}
                </div>
                <div className="mt-3 text-sm text-muted">
                  Suggested roles: {giftsByKey[key]?.roles.join(", ")}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            {sortedResults.map(([key, score]) => (
              <div key={key} className="grid grid-cols-[10rem_1fr_3rem] items-center gap-3 text-sm">
                <span className="font-semibold text-ink">{spiritualGiftNames[key]}</span>
                <span className="h-2 overflow-hidden rounded-full bg-cream">
                  <span
                    className="block h-full rounded-full bg-green"
                    style={{ width: `${Math.max(4, (score / 15) * 100)}%` }}
                  />
                </span>
                <span className="text-right font-bold text-muted">{score}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function AssessmentExperience() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeAssessment, setActiveAssessment] = useState<AssessmentType>("disc");
  const [saved, setSaved] = useState<SavedState>({});
  const [formError, setFormError] = useState("");

  function startAssessments(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail.includes("@")) {
      setFormError("Enter your name and a valid email address to begin.");
      return;
    }

    setParticipant({ name: trimmedName, email: trimmedEmail });
    setFormError("");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
          City View Assessments
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Discover how you are wired to connect and serve.
        </h1>
      </div>

      {!participant ? (
        <form
          className="bg-white p-6 shadow-sm sm:p-8"
          onSubmit={startAssessments}
        >
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-green">
            <UserRound size={18} />
            Start Here
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Name
              <input
                className="min-h-12 rounded-md border border-ink/15 px-4 text-base"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Email
              <input
                className="min-h-12 rounded-md border border-ink/15 px-4 text-base"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                type="email"
              />
            </label>
          </div>
          {formError ? (
            <p className="mt-4 font-semibold text-[#a33b31]">{formError}</p>
          ) : null}
          <button
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-terracotta px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#a65735]"
            type="submit"
          >
            Begin Assessments
          </button>
        </form>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              Taking as <strong className="text-ink">{participant.name}</strong>{" "}
              ({participant.email})
            </div>
            <div className="flex gap-2">
              <button
                className={`rounded-md px-4 py-2 text-sm font-bold ${
                  activeAssessment === "disc"
                    ? "bg-terracotta text-white"
                    : "bg-cream text-ink"
                }`}
                type="button"
                onClick={() => setActiveAssessment("disc")}
              >
                DISC
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-bold ${
                  activeAssessment === "spiritual_gifts"
                    ? "bg-green text-white"
                    : "bg-cream text-ink"
                }`}
                type="button"
                onClick={() => setActiveAssessment("spiritual_gifts")}
              >
                Spiritual Gifts
              </button>
            </div>
          </div>

          {saved[activeAssessment] ? (
            <div className="mb-5 flex items-center gap-2 rounded-md bg-white p-4 text-sm font-semibold text-green shadow-sm">
              <CheckCircle2 size={18} />
              {saved[activeAssessment]}
            </div>
          ) : null}

          {activeAssessment === "disc" ? (
            <DiscAssessment
              participant={participant}
              onSaved={(type, message) =>
                setSaved((current) => ({ ...current, [type]: message }))
              }
            />
          ) : (
            <SpiritualGiftsAssessment
              participant={participant}
              onSaved={(type, message) =>
                setSaved((current) => ({ ...current, [type]: message }))
              }
            />
          )}
        </>
      )}
    </div>
  );
}
