import {sharingMetadata} from '@/lib/proofadmin/sharing-server';
import { redirect } from "next/navigation";

export default function WatchRedirectPage() {
  redirect("/sermon-archive");
}

export async function generateMetadata(){return sharingMetadata('/watch');}
