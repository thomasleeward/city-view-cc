import {proofAdminEnabled,sharedContent} from '@/lib/proofadmin/server';
import {Announcements} from "@/lib/proofadmin/announcements";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  if(proofAdminEnabled()){const {configuration}=await sharedContent();return <><style>{'body:has(.proof-link-page) .proof-site-header,body:has(.proof-link-page) .proof-site-footer{display:none}'}</style><Announcements value={configuration.announcements}/><div className="proof-site-header"><Header configuration={configuration}/></div>{children}<div className="proof-site-footer"><Footer configuration={configuration}/></div></>;}
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
