import {proofAdminEnabled,sharedContent} from '@/lib/proofadmin/server';
import {Announcements} from "@/lib/proofadmin/announcements";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  if(proofAdminEnabled()){const {configuration}=await sharedContent();return <><Announcements value={configuration.announcements}/><Header configuration={configuration}/>{children}<Footer configuration={configuration}/></>;}
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
