import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/config";

export default function GivingPage() {
  // TODO: Replace SecureGive with the final giving URL when Planning Center/Giving config is chosen.
  redirect(siteConfig.external.giving);
}
