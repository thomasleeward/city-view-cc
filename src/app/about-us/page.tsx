import {sharingMetadata} from '@/lib/proofadmin/sharing-server';
import { redirect } from "next/navigation";

export default function AboutUsRedirectPage() {
  redirect("/about");
}

export async function generateMetadata(){return sharingMetadata('/about-us');}
