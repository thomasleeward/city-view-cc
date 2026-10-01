import {proofAdminEnabled,sharedContent} from '@/lib/proofadmin/server';
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  if(proofAdminEnabled()){const {configuration}=await sharedContent();return <><Header configuration={configuration}/>{children}<Footer configuration={configuration}/></>;}
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
