import {proofAdminEnabled} from '@/lib/proofadmin/server';
import {EventCollection} from '@/lib/proofadmin/event-collection';
import {sharingMetadata} from '@/lib/proofadmin/sharing-server';
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { siteConfig } from "@/lib/config";

export default function EventsPage() {
  if(proofAdminEnabled())return <><PageHero eyebrow="Events" title="Upcoming events" description="Find your next gathering at City View."/><Section><EventCollection site="city-view" element={{type:'all_events'}}/></Section></>;
  // TODO: Replace this placeholder with Planning Center Events API or Church Center URL.
  if (siteConfig.external.events) {
    redirect(siteConfig.external.events);
  }

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Events are moving soon."
        description="This route is ready to redirect to Planning Center / Church Center once the URL is available."
      />
      <Section>
        <p className="max-w-2xl text-lg leading-8 text-muted">
          Add `NEXT_PUBLIC_EVENTS_URL` to redirect visitors to the church events
          calendar. Planning Center API integration can be added later without
          changing this public route.
        </p>
        <Button href="/get-connected" className="mt-6">
          Get Connected
        </Button>
      </Section>
    </>
  );
}

export async function generateMetadata(){return sharingMetadata('/events');}
