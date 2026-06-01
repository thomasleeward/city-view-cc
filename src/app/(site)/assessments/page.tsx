import type { Metadata } from "next";
import { AssessmentExperience } from "./AssessmentExperience";

export const metadata: Metadata = {
  title: "Assessments | City View Community Church",
  description: "Take the City View DISC and spiritual gifts assessments.",
};

export default function AssessmentsPage() {
  return (
    <main className="min-h-screen bg-cream">
      <AssessmentExperience />
    </main>
  );
}

