import Image from 'next/image';
import {Button} from '@/components/ui/Button';
import {HomeHero} from '@/components/site/HomeHero';
import {Section} from '@/components/site/Section';
import {PageHero} from '@/components/site/PageHero';
import {SermonSeriesCard} from '@/components/site/SermonSeriesCard';
import {YouTubePlaylistEmbed} from '@/components/site/YouTubePlaylistEmbed';
import {StatementOfFaith} from '@/components/site/StatementOfFaith';
import {RichInline} from './rich-text';
import type {Section as CmsSection,GroupContent} from './contract';
import type {SiteConfiguration} from './site-configuration';
import {siteConfig as defaults} from '@/lib/config';
export function field(section:CmsSection,id:string){return section.native?.fields.find(f=>f.id===id)?.value??'';}
export function adaptConfiguration(configuration:SiteConfiguration){
 const {settings:s,navigation}=configuration;const place=s.city_state_zip.match(/^(.*),\s*(\S+)\s+(.*)$/);
 return {...defaults,name:s.church_name,email:s.email,serviceTimes:s.services,address:{line1:s.address,city:place?.[1]??s.city_state_zip,state:place?.[2]??'',postalCode:place?.[3]??''},social:{...defaults.social,instagram:s.instagram,youtube:s.youtube,facebook:navigation.find(n=>n.location==='footer'&&n.label==='Facebook')?.action_value??defaults.social.facebook},external:{...defaults.external,events:navigation.find(n=>n.label==='Events')?.action_value??defaults.external.events}};
}
export function NativeSection({s,groups,configuration}:{s:CmsSection;groups:Record<string,GroupContent>;configuration:SiteConfiguration}){
 const cards=(key:string)=>{const id=s.native?.groups.find(g=>g.key===key)?.id;return (id?groups[id]?.cards??[]:[]).filter(c=>!c.hidden);};
 const siteConfig=adaptConfiguration(configuration);
 const slides=cards('slideshow').map((c,i)=>({id:c.id,imageUrl:c.image||null,videoUrl:c.video||null,sortOrder:i}));
 const sermonSeries=cards('sermon-series').map(c=>({id:c.id,name:c.title,dateLabel:c.description,startDate:c.seriesDates?.start??'',endDate:c.seriesDates?.end??null,imageUrl:c.image,youtubePlaylistUrl:c.action.value,isPublished:true}));
 const latestSeries=sermonSeries.slice(0,3),series=sermonSeries,latest=series[0],archiveSeries=series.slice(1);
 const ministryCards=cards('ministries').map(c=>({title:c.title,details:c.details,description:c.description,imageUrl:c.image,href:c.action.value}));
 const team=cards('team');const lead=team[0];
 const leadPastors={name:lead?.title??'',role:lead?.subtitle??'',email:lead?.action.value.replace(/^mailto:/,'')??'',imageUrl:lead?.image??'',bio:lead?.description.split(/\n\s*\n/)??[]};
 const teamMembers=team.slice(1).map(c=>({name:c.title,role:c.subtitle??'',email:c.action.value.replace(/^mailto:/,''),imageUrl:c.image}));
 const beliefStatements=cards('beliefs').map(c=>({title:c.title,preview:c.subtitle??'',statement:c.description}));
 const gospelStatements=cards('gospel').map(c=>({title:c.title,preview:c.subtitle??'',statement:c.description}));
 const discoverPurposeCards=cards('connect-groups').map(c=>({title:c.title,description:c.description,imageUrl:c.image,cta:c.action.label,href:c.action.value}));
 const serveTeams=cards('serve-teams').map(c=>c.title);
 const connectHref=siteConfig.external.events,prayerHref=siteConfig.external.prayerRequest||`mailto:${siteConfig.email}`;
 switch(s.native?.template){
case 'city-view-home-0': return (<HomeHero content={{eyebrow:field(s,'eyebrow'),headline:field(s,'headline'),subheadline:field(s,'subheadline'),ctaLabel:field(s,'ctaLabel'),ctaHref:field(s,'ctaHref')}} slides={slides} />);
case 'city-view-home-1': return (<Section className="bg-white" title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="space-y-5 text-lg leading-8 text-muted">
            <p>{field(s,'field-2')}</p>
            <p>
              <RichInline text={field(s,'field-3')}/></p>
          </div>
          <div className="rounded-lg bg-cream p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
              <RichInline text={field(s,'field-4')}/></p>
            <p className="mt-3 text-2xl font-bold text-ink">
              {siteConfig.serviceTimes}
            </p>
            <p className="mt-3 text-muted">
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.city}<RichInline text={field(s,'field-5')}/>{siteConfig.address.state}{" "}
              {siteConfig.address.postalCode}
            </p>
            <Button href={field(s,'field-6')} className="mt-6">
              {field(s,'field-7')}</Button>
          </div>
        </div>
      </Section>);
case 'city-view-home-2': return (<Section
        eyebrow={field(s,'field-0')}
        title={field(s,'field-1')}
        description={field(s,'field-2')}
      >
        <div className="grid gap-5 md:grid-cols-3">
          {ministryCards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <div className="relative aspect-video bg-cream">
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold">{card.title}</h3>
                {"details" in card && card.details ? (
                  <div className="mt-3 space-y-1 font-bold text-terracotta">
                    {card.details.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 text-muted">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>);
case 'city-view-home-3': return (<Section className="bg-green text-white">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gold">
            <RichInline text={field(s,'field-0')}/></p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
            {field(s,'field-1')}</h2>
          <p className="mt-4 text-lg leading-8 text-white/80">
            <RichInline text={field(s,'field-2')}/></p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {latestSeries.map((series) => (
            <SermonSeriesCard key={series.id} series={series} />
          ))}
        </div>
        <Button href={field(s,'field-3')} variant="light" className="mt-8">
          {field(s,'field-4')}</Button>
      </Section>);
case 'city-view-home-4': return (<Section className="bg-white" title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <p className="max-w-3xl text-lg leading-8 text-muted">
            <RichInline text={field(s,'field-2')}/></p>
          <Button href={field(s,'field-3')} variant="secondary">
            {field(s,'field-4')}</Button>
        </div>
      </Section>);
case 'city-view-home-5': return (<section className="bg-[#ee5f01] py-12 text-white sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
              <RichInline text={field(s,'field-0')}/></p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
              {field(s,'field-1')}</h2>
            <p className="mt-5 max-w-4xl text-lg leading-8 text-white/90">
              <RichInline text={field(s,'field-2')}/></p>
          </div>
          <Button
            href={field(s,'field-3')}
            variant="light"
            className="w-full lg:w-auto"
          >
            {field(s,'field-4')}</Button>
        </div>
      </section>);
case 'city-view-about-0': return (<PageHero
        eyebrow={field(s,'field-0')}
        title={field(s,'field-1')}
        description={field(s,'field-2')}
      />);
case 'city-view-about-1': return (<Section title={field(s,'field-0')}>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={field(s,'field-1')}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-5 text-lg leading-8 text-muted">
            <p>
              <RichInline text={field(s,'field-2')}/></p>
            <p>
              <RichInline text={field(s,'field-3')}/></p>
          </div>
        </div>
      </Section>);
case 'city-view-about-2': return (<Section className="bg-white" title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <article className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full">
            <Image
              src={leadPastors.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="font-display text-4xl font-bold">
              {leadPastors.name}
            </h2>
            <p className="mt-2 text-2xl text-ink">{leadPastors.role}</p>
            <a
              className="mt-2 block font-semibold text-terracotta"
              href={`mailto:${leadPastors.email}`}
            >
              {leadPastors.email}
            </a>
            <div className="mx-auto my-6 h-px w-64 max-w-full bg-ink/20 lg:mx-0" />
            <div className="space-y-5 text-lg leading-8 text-muted">
              {leadPastors.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((person) => (
            <article key={person.name} className="rounded-lg bg-cream p-4">
              <div className="relative aspect-square overflow-hidden rounded-md">
                {person.imageUrl ? (
                  <Image
                    src={person.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-full items-center justify-center bg-ink/10 font-display text-5xl font-bold text-ink/45"
                  >
                    {person.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                )}
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">{person.name}</h3>
              {person.role ? (
                <p className="font-semibold text-terracotta">{person.role}</p>
              ) : null}
              {person.email ? (
                <a className="mt-2 block text-sm text-muted" href={`mailto:${person.email}`}>
                  {person.email}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </Section>);
case 'city-view-about-3': return (<Section title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <StatementOfFaith intro={field(s,'field-2')} statements={beliefStatements} />
      </Section>);
case 'city-view-get-connected-0': return (<PageHero
        eyebrow={field(s,'field-0')}
        title={field(s,'field-1')}
        description={field(s,'field-2')}
      />);
case 'city-view-get-connected-1': return (<Section className="bg-white" title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <div className="grid gap-6 md:grid-cols-2">
          {discoverPurposeCards.map((card) => (
            <article key={card.title} className="rounded-lg bg-cream p-5">
              <div className="relative aspect-video overflow-hidden rounded-md bg-cream">
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain"
                />
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold">
                {card.title}
              </h2>
              <p className="mt-4 leading-7 text-muted">{card.description}</p>
              <Button href={card.href} className="mt-6">
                {card.cta}
              </Button>
            </article>
          ))}
        </div>
      </Section>);
case 'city-view-get-connected-2': return (<Section title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg lg:max-w-none">
            <Image
              src={field(s,'field-2')}
              alt=""
              width={961}
              height={1201}
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          <article className="flex flex-col justify-center rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-3xl font-bold text-ink">
              {field(s,'field-3')}</h2>
            <div className="mt-4 space-y-4 leading-7 text-muted">
              <p>
                <RichInline text={field(s,'field-4')}/></p>
              <p>
                <RichInline text={field(s,'field-5')}/></p>
              <p>
                <RichInline text={field(s,'field-6')}/></p>
              <p>
                <RichInline text={field(s,'field-7')}/></p>
              <p>
                <RichInline text={field(s,'field-8')}/></p>
            </div>
            <Button href={connectHref} className="mt-6">
              {field(s,'field-9')}</Button>
          </article>
        </div>
      </Section>);
case 'city-view-get-connected-3': return (<Section className="bg-green text-white">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gold">
            <RichInline text={field(s,'field-0')}/></p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
            {field(s,'field-1')}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serveTeams.map((team) => (
            <div key={team} className="rounded-lg bg-white/10 p-4 font-semibold">
              {team}
            </div>
          ))}
        </div>
        <Button href={connectHref} variant="light" className="mt-8">
          {field(s,'field-2')}</Button>
      </Section>);
case 'city-view-get-connected-4': return (<Section title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <div className="grid gap-6">
          <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <div className="mx-auto max-w-5xl text-left">
              <h2 className="font-display text-4xl font-bold text-ink">
                {field(s,'field-2')}</h2>
              <div className="mt-6">
                <StatementOfFaith
                  intro={field(s,'field-3')}
                  statements={gospelStatements}
                >
                  <div className="flex min-h-36 items-center rounded-lg border border-terracotta/20 bg-cream p-6 shadow-sm">
                    <p className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                      <RichInline text={field(s,'field-4')}/></p>
                  </div>
                </StatementOfFaith>
              </div>
            </div>
          </article>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-3xl font-bold text-ink">
                {field(s,'field-5')}</h2>
              <p className="mt-4 leading-7 text-muted">
                <RichInline text={field(s,'field-6')}/></p>
              <Button href={connectHref} className="mt-6">
                {field(s,'field-7')}</Button>
            </article>

            <article className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-3xl font-bold text-ink">
                {field(s,'field-8')}</h2>
              <p className="mt-4 leading-7 text-muted">
                <RichInline text={field(s,'field-9')}/></p>
              <Button
                href={field(s,'field-10')}
                className="mt-6"
              >
                {field(s,'field-11')}</Button>
            </article>
          </div>
        </div>
      </Section>);
case 'city-view-get-connected-5': return (<Section title={field(s,'field-0')} eyebrow={field(s,'field-1')}>
        <p className="max-w-3xl text-lg leading-8 text-muted">
          <RichInline text={field(s,'field-2')}/></p>
        <Button href={prayerHref} className="mt-6">
          {field(s,'field-3')}</Button>
      </Section>);
case 'city-view-sermon-archive-0': return (<PageHero
        eyebrow={field(s,'field-0')}
        title={field(s,'field-1')}
        description={field(s,'field-2')}
      />);
case 'city-view-sermon-archive-1': return (<Section>
        {latest && (
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <YouTubePlaylistEmbed
              url={latest.youtubePlaylistUrl}
              title={`${latest.name} playlist`}
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
                <RichInline text={field(s,'field-0')}/></p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">
                {latest.name}
              </h2>
              <p className="mt-3 text-lg text-muted">{latest.dateLabel}</p>
            </div>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {archiveSeries.map((item) => (
            <SermonSeriesCard key={item.id} series={item} />
          ))}
        </div>
      </Section>);
default: return null;
}
}
