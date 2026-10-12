import {sharingMetadata} from '@/lib/proofadmin/sharing-server';
import { redirect } from "next/navigation";

export default function GetInvolvedRedirectPage() {
  redirect("/get-connected");
}

export async function generateMetadata(){return sharingMetadata('/get-involved');}
