import {proofAdminEnabled} from '@/lib/proofadmin/server';
import type { Metadata } from "next";
import { AssessmentExperience } from "./AssessmentExperience";

export const metadata: Metadata = {
  title: "Assessments | City View Community Church",
  description: "Take the City View DISC and spiritual gifts assessments.",
};

export default function AssessmentsPage() {
  return (
    <main className="min-h-screen bg-cream">
      {proofAdminEnabled()&&<p role="status" className="mx-auto max-w-6xl px-5 py-5">Review preview: assessment results are not saved here. <a className="underline" href="https://www.cityviewcc.com/assessments">Use the live assessment</a>.</p>}
      <AssessmentExperience />
    </main>
  );
}

